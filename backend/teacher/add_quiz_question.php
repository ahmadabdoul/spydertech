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
        // Get raw inputs
        $quiz_id_raw = $obj['quiz_id'];
        $question_text_raw = trim($obj['question_text']);
        $option_a_raw = trim($obj['option_a']);
        $option_b_raw = trim($obj['option_b']);
        $correct_option_raw = trim(strtolower($obj['correct_option'])); // Ensure lowercase and trim

        $option_c_raw = isset($obj['option_c']) ? trim($obj['option_c']) : '';
        $option_d_raw = isset($obj['option_d']) ? trim($obj['option_d']) : '';

        // Validate inputs
        $quiz_id = filter_var($quiz_id_raw, FILTER_VALIDATE_INT);

        if ($quiz_id === false) {
            $response['status'] = 1;
            $response['message'] = 'Quiz ID must be a valid integer.';
        } elseif (empty($question_text_raw) || empty($option_a_raw) || empty($option_b_raw) || empty($correct_option_raw)) {
            $response['status'] = 1;
            $response['message'] = 'Question text, option A, option B, and correct option cannot be empty.';
        } else {
            $valid_correct_options = ['a', 'b', 'c', 'd'];
            if (!in_array($correct_option_raw, $valid_correct_options)) {
                $response['status'] = 1;
                $response['message'] = "Invalid 'correct_option'. Must be one of 'a', 'b', 'c', or 'd'.";
            } else {
                // Prepare optional fields for SQL (use NULL if empty string)
                $option_c_prepared = !empty($option_c_raw) ? $option_c_raw : NULL;
                $option_d_prepared = !empty($option_d_raw) ? $option_d_raw : NULL;

                // SQL query with placeholders
                $query = "INSERT INTO quiz_questions
                              (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option)
                          VALUES (?, ?, ?, ?, ?, ?, ?)";

                $stmt = mysqli_prepare($conn, $query);
                if ($stmt) {
                    // Bind parameters: i for integer, s for string.
                    // For nullable strings, pass the variable directly. MySQLi handles NULL correctly.
                    mysqli_stmt_bind_param($stmt, "issssss",
                        $quiz_id,
                        $question_text_raw,
                        $option_a_raw,
                        $option_b_raw,
                        $option_c_prepared,
                        $option_d_prepared,
                        $correct_option_raw
                    );

                    if (mysqli_stmt_execute($stmt)) {
                        $response['status'] = 0;
                        $response['message'] = 'Question added successfully.';
                        $response['question_id'] = mysqli_insert_id($conn);
                    } else {
                        $response['status'] = 1;
                        $response['message'] = 'Error adding question: ' . mysqli_stmt_error($stmt);
                    }
                    mysqli_stmt_close($stmt);
                } else {
                    $response['status'] = 1;
                    $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
                }
            }
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
