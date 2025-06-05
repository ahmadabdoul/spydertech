<?php
session_start(); // Start session for potential future use

header('Content-Type: application/json');

require_once '../assets/connection.php';
// inject.php might not be strictly needed here as we're focusing on prepared statements
// but include if it has other site-wide configurations.
require_once '../assets/inject.php';

$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

// Validate JSON payload and required fields
if (!$obj) {
    $response = array('status' => 1, 'message' => 'Invalid JSON payload.');
    echo json_encode($response);
    mysqli_close($conn);
    exit;
}

$required_fields = ['student_id', 'course_id', 'content_id', 'completed_status'];
$missing_fields = [];
foreach ($required_fields as $field) {
    if (!isset($obj[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    $response = array('status' => 1, 'message' => 'Required fields are missing: ' . implode(', ', $missing_fields));
    echo json_encode($response);
    mysqli_close($conn);
    exit;
}

// Prepare data for insertion/update
// No need for mysql_entities_fix_string when using prepared statements for these values
$student_id = filter_var($obj['student_id'], FILTER_VALIDATE_INT);
$course_id = filter_var($obj['course_id'], FILTER_VALIDATE_INT);
$content_id = filter_var($obj['content_id'], FILTER_VALIDATE_INT);

// Validate integer IDs
if ($student_id === false || $course_id === false || $content_id === false) {
    $response = array('status' => 1, 'message' => 'Student ID, Course ID, and Content ID must be integers.');
    echo json_encode($response);
    mysqli_close($conn);
    exit;
}


// Convert completed_status (e.g., from JS true/false) to tinyint (1 or 0)
$completed_status_input = $obj['completed_status'];
if (!is_bool($completed_status_input) && !is_numeric($completed_status_input)) {
     $response = array('status' => 1, 'message' => 'completed_status must be a boolean or numeric (0/1).');
    echo json_encode($response);
    mysqli_close($conn);
    exit;
}
$completed_status_for_db = $completed_status_input ? 1 : 0;


// last_position is optional, default to NULL if not provided or empty
$last_position = isset($obj['last_position']) && $obj['last_position'] !== '' ? (string)$obj['last_position'] : null;


// SQL UPSERT query using ON DUPLICATE KEY UPDATE
// last_updated is handled by MySQL's DEFAULT current_timestamp() ON UPDATE current_timestamp()
$query = "INSERT INTO student_content_progress
              (student_id, course_id, content_id, completed_status, last_position, last_updated)
          VALUES
              (?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
              completed_status = VALUES(completed_status),
              last_position = VALUES(last_position),
              last_updated = NOW()";

$stmt = mysqli_prepare($conn, $query);

if ($stmt) {
    // Bind parameters: i = integer, s = string
    // student_id (i), course_id (i), content_id (i), completed_status_for_db (i), last_position (s)
    mysqli_stmt_bind_param($stmt, "iiiis",
        $student_id,
        $course_id,
        $content_id,
        $completed_status_for_db,
        $last_position
    );

    if (mysqli_stmt_execute($stmt)) {
        // mysqli_stmt_affected_rows will be 1 for an INSERT,
        // 2 for an UPDATE if data changed,
        // or 0 if an UPDATE occurred but no data changed.
        // For UPSERT, success is generally no error.
        $response['status'] = 0;
        $response['message'] = 'Progress updated successfully.';
        if (mysqli_stmt_affected_rows($stmt) == 1) {
            $response['action'] = 'inserted';
        } elseif (mysqli_stmt_affected_rows($stmt) >= 0) { // 0 or 2 for update
             $response['action'] = 'updated';
        }

    } else {
        $response['status'] = 1;
        $response['message'] = 'Error updating progress: ' . mysqli_stmt_error($stmt);
    }
    mysqli_stmt_close($stmt);
} else {
    $response['status'] = 1;
    $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
}

// Return JSON response
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
