<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Assuming you have established a database connection

// Check if the student ID is provided
if (isset($_GET['id'])) {
    // Get the student ID
    $studentId = $_GET['id'];

    // Prepare the query to retrieve student courses and their completion status
    $query = "SELECT sc.course_id, sc.completion_status, c.title AS course_title";
    $query .= " FROM student_courses sc";
    $query .= " INNER JOIN courses c ON sc.course_id = c.id";
    $query .= " WHERE sc.student_id = " . $studentId;

    // Execute the query
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of student courses.')));

    // Check if there are any student courses
    if (mysqli_num_rows($result) > 0) {
        $response = array();
        $response['status'] = 0;
        $response['student_id'] = $studentId;
        $response['courses'] = array();

        // Loop through each row and fetch the course information
        while ($row = mysqli_fetch_assoc($result)) {
            $courseId = $row['course_id'];
            $completionStatus = $row['completion_status'];
            $courseTitle = $row['course_title'];

            $response['courses'][] = array('course_id' => $courseId, 'completion_status' => $completionStatus, 'course_title' => $courseTitle);
        }
    } else {
        // No courses found for the student
        $response['status'] = 1;
        $response['message'] = 'No Courses Found for the Student';
    }
} else {
    // Student ID not provided
    $response['status'] = 1;
    $response['message'] = 'Student ID is missing';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
