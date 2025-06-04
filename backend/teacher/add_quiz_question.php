<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Check if decoding was successful
if ($obj) {
    // Required fields
    $required_fields = ['quiz_id', 'question_text', 'option_a', 'option_b', 'correct_option'];
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (!isset($obj[$field])) {
            $missing_fields[] = $field;
        }
    }

    if (empty($missing_fields)) {
        // Sanitize all inputs
        $quiz_id = mysql_entities_fix_string($conn, $obj['quiz_id']);
        $question_text = mysql_entities_fix_string($conn, $obj['question_text']);
        $option_a = mysql_entities_fix_string($conn, $obj['option_a']);
        $option_b = mysql_entities_fix_string($conn, $obj['option_b']);
        $correct_option = mysql_entities_fix_string($conn, strtolower($obj['correct_option'])); // Ensure lowercase

        // Sanitize optional fields (option_c, option_d)
        $option_c = isset($obj['option_c']) ? mysql_entities_fix_string($conn, $obj['option_c']) : '';
        $option_d = isset($obj['option_d']) ? mysql_entities_fix_string($conn, $obj['option_d']) : '';

        // Validate that required sanitized inputs are not empty
        if (!empty($quiz_id) && !empty($question_text) && !empty($option_a) && !empty($option_b) && !empty($correct_option)) {

            // Validate correct_option
            $valid_correct_options = ['a', 'b', 'c', 'd'];
            if (!in_array($correct_option, $valid_correct_options)) {
                $response['status'] = 1;
                $response['message'] = "Invalid 'correct_option'. Must be one of 'a', 'b', 'c', or 'd'.";
            } else {
                // Prepare optional fields for SQL (insert NULL if empty)
                $option_c_for_sql = !empty($option_c) ? "'$option_c'" : "NULL";
                $option_d_for_sql = !empty($option_d) ? "'$option_d'" : "NULL";

                // Construct the SQL query
                $query = "INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option)
                          VALUES ('$quiz_id', '$question_text', '$option_a', '$option_b', $option_c_for_sql, $option_d_for_sql, '$correct_option')";

                // Execute the query
                $result = mysqli_query($conn, $query);

                if ($result) {
                    $response['status'] = 0;
                    $response['message'] = 'Question added successfully.';
                    // Optionally, return the ID of the newly added question
                    // $response['question_id'] = mysqli_insert_id($conn);
                } else {
                    $response['status'] = 1;
                    $response['message'] = 'Error adding question: ' . mysqli_error($conn);
                }
            }
        } else {
            $empty_sanitized_fields = [];
            if (empty($quiz_id)) $empty_sanitized_fields[] = 'quiz_id';
            if (empty($question_text)) $empty_sanitized_fields[] = 'question_text';
            if (empty($option_a)) $empty_sanitized_fields[] = 'option_a';
            if (empty($option_b)) $empty_sanitized_fields[] = 'option_b';
            if (empty($correct_option)) $empty_sanitized_fields[] = 'correct_option';

            $response['status'] = 1;
            $response['message'] = 'Required fields cannot be empty after sanitization: ' . implode(', ', $empty_sanitized_fields);
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Required fields are missing: ' . implode(', ', $missing_fields);
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Invalid JSON payload.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
