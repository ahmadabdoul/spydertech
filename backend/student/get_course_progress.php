<?php
session_start(); // Start session for potential future use

header('Content-Type: application/json');

require_once '../assets/connection.php';
// inject.php might not be strictly needed if inputs are handled via filter_var for prepared statements
// require_once '../assets/inject.php';

$response = array();

// Validate that student_id and course_id are provided
if (!isset($_GET['student_id']) || !isset($_GET['course_id'])) {
    $response = array('status' => 1, 'message' => 'Student ID and Course ID are required.');
    echo json_encode($response);
    if (isset($conn)) mysqli_close($conn);
    exit;
}

// Sanitize/validate inputs (expecting integers)
$student_id = filter_var($_GET['student_id'], FILTER_VALIDATE_INT);
$course_id = filter_var($_GET['course_id'], FILTER_VALIDATE_INT);

if ($student_id === false || $course_id === false) {
    $response = array('status' => 1, 'message' => 'Student ID and Course ID must be valid integers.');
    echo json_encode($response);
    if (isset($conn)) mysqli_close($conn);
    exit;
}

// SQL SELECT query using prepared statements
$query = "SELECT content_id, completed_status, last_position
          FROM student_content_progress
          WHERE student_id = ? AND course_id = ?";

$stmt = mysqli_prepare($conn, $query);

if ($stmt) {
    // Bind parameters: i = integer
    mysqli_stmt_bind_param($stmt, "ii", $student_id, $course_id);

    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        $progress_records = array();

        while ($row = mysqli_fetch_assoc($result)) {
            // Ensure completed_status is boolean or 0/1 for JSON consistency
            $row['completed_status'] = (bool)$row['completed_status'];
            // Alternatively, to ensure 0 or 1:
            // $row['completed_status'] = intval($row['completed_status']);
            $progress_records[] = $row;
        }

        $response['status'] = 0;
        $response['progress'] = $progress_records; // Will be an empty array if no records found

    } else {
        $response['status'] = 1;
        $response['message'] = 'Error executing statement: ' . mysqli_stmt_error($stmt);
    }
    mysqli_stmt_close($stmt);
} else {
    $response['status'] = 1;
    $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
}

// Return JSON response
echo json_encode($response);

// Close the database connection
if (isset($conn)) mysqli_close($conn);
?>
