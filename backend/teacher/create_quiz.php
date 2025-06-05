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

    $course_id_raw = $obj['course_id'];
    $quiz_title_raw = trim($obj['quiz_title']); // Trim whitespace

    // Validate inputs
    $course_id = filter_var($course_id_raw, FILTER_VALIDATE_INT);

    if ($course_id === false) {
        $response['status'] = 1;
        $response['message'] = 'Course ID must be a valid integer.';
    } elseif (empty($quiz_title_raw)) {
        $response['status'] = 1;
        $response['message'] = 'Quiz Title cannot be empty.';
    } else {
        // SQL query with placeholders
        $query = "INSERT INTO quizzes (course_id, title) VALUES (?, ?)";

        $stmt = mysqli_prepare($conn, $query);
        if ($stmt) {
            // Bind parameters: "is" means integer for course_id, string for title
            mysqli_stmt_bind_param($stmt, "is", $course_id, $quiz_title_raw);

            if (mysqli_stmt_execute($stmt)) {
                $response['status'] = 0;
                $response['message'] = 'Quiz created successfully.';
                $response['quiz_id'] = mysqli_insert_id($conn); // Get the ID of the newly inserted quiz
            } else {
                $response['status'] = 1;
                $response['message'] = 'Error creating quiz: ' . mysqli_stmt_error($stmt);
            }
            mysqli_stmt_close($stmt);
        } else {
            $response['status'] = 1;
            $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
        }
    }
} else {
    // Handle cases where JSON is invalid or fields are missing
    if (!$obj) {
        $response['status'] = 1;
        $response['message'] = 'Invalid JSON payload.';
    } else {
        $missing_fields = [];
        if (!isset($obj['course_id'])) $missing_fields[] = 'course_id';
        if (!isset($obj['quiz_title'])) $missing_fields[] = 'quiz_title';
        $response['status'] = 1;
        $response['message'] = 'Required fields are missing: ' . implode(', ', $missing_fields);
    }
}

// Return JSON response
header('Content-Type: application/json'); // Ensure header is set before any output
echo json_encode($response);

// Close the database connection
if (isset($conn)) mysqli_close($conn); // Check if $conn is set before closing
?>
