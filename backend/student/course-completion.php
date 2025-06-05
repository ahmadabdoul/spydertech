<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize response array
$response = array(
    'status' => 1, // Default to error
    'message' => 'An unknown error occurred.'
);

// Retrieve the JSON payload
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Check if student_id and course_id are provided
if (isset($data['student_id']) && isset($data['course_id'])) {
    $student_id = mysql_entities_fix_string($conn, $data['student_id']);
    $course_id = mysql_entities_fix_string($conn, $data['course_id']);

    // Check if the student is enrolled in the course
    $enrollment_check_query = "SELECT * FROM student_courses WHERE student_id = '$student_id' AND course_id = '$course_id'";
    $enrollment_check_result = mysqli_query($conn, $enrollment_check_query);

    if ($enrollment_check_result && mysqli_num_rows($enrollment_check_result) > 0) {
        $enrollment_data = mysqli_fetch_assoc($enrollment_check_result);

        // Check if the course is already marked as completed
        if ($enrollment_data['completion_status'] === 'Completed') {
            $response['status'] = 0; // Success, but no action needed
            $response['message'] = 'Course is already marked as completed.';
        } else {
            // Mark the course as completed
            $update_query = "UPDATE student_courses SET completion_status = 'Completed', completion_date = NOW() WHERE student_id = '$student_id' AND course_id = '$course_id'";
            $update_result = mysqli_query($conn, $update_query);

            if ($update_result) {
                // Check if any row was actually updated
                if (mysqli_affected_rows($conn) > 0) {
                    $response['status'] = 0; // Success
                    $response['message'] = 'Course marked as completed successfully.';
                } else {
                    // This case might occur if the status was already 'Completed' but the initial check missed it (race condition, though unlikely here)
                    // or if the WHERE clause didn't match (student_id, course_id).
                    // Given the prior enrollment check, this implies it might already be completed.
                    $response['status'] = 0; // Still considered success as the desired state is achieved or was already true
                    $response['message'] = 'Course completion status was already up-to-date or no change was needed.';
                }
            } else {
                $response['status'] = 1; // Error
                $response['message'] = 'Failed to update course completion status. Error: ' . mysqli_error($conn);
            }
        }
    } else {
        $response['status'] = 1; // Error
        $response['message'] = 'Student is not enrolled in this course.';
    }
} else {
    $response['status'] = 1; // Error
    $response['message'] = 'Missing student_id or course_id in the request.';
    if (!isset($data['student_id'])) {
        $response['message'] = 'Student ID is required.';
    } elseif (!isset($data['course_id'])) {
        $response['message'] = 'Course ID is required.';
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>