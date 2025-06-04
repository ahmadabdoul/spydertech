<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Check if decoding was successful and input fields are present
if ($obj && isset($obj['course_id'], $obj['quiz_title'])) {
    // Sanitize input data
    $course_id = mysql_entities_fix_string($conn, $obj['course_id']);
    $quiz_title = mysql_entities_fix_string($conn, $obj['quiz_title']);

    // Validate that the sanitized inputs are not empty
    if (!empty($course_id) && !empty($quiz_title)) {
        // Construct the SQL query
        $query = "INSERT INTO quizzes (course_id, title) VALUES ('$course_id', '$quiz_title')";

        // Execute the query
        $result = mysqli_query($conn, $query);

        if ($result) {
            $response['status'] = 0;
            $response['message'] = 'Quiz created successfully.';
            // Optionally, you could return the ID of the newly created quiz
            // $response['quiz_id'] = mysqli_insert_id($conn);
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error creating quiz: ' . mysqli_error($conn);
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Course ID and Quiz Title cannot be empty.';
    }
} else {
    // Handle cases where JSON is invalid or fields are missing
    if (!$obj) {
        $response['status'] = 1;
        $response['message'] = 'Invalid JSON payload.';
    } else {
        $missing_fields = [];
        if (!isset($obj['course_id'])) {
            $missing_fields[] = 'course_id';
        }
        if (!isset($obj['quiz_title'])) {
            $missing_fields[] = 'quiz_title';
        }
        $response['status'] = 1;
        $response['message'] = 'Required fields are missing: ' . implode(', ', $missing_fields);
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
