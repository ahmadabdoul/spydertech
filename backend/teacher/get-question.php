<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize response
$response = array();

// Check if the 'id' parameter is provided
if (isset($_GET['id'])) {
    // Sanitize the 'id' parameter
    $questionId = mysqli_real_escape_string($conn, $_GET['id']);

    // Retrieve the question from course_qa table
    $query = "SELECT * FROM course_qa WHERE id = '$questionId'";
    $result = mysqli_query($conn, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);

        // Fetch student name from users table
        $studentId = $row['student_id'];
        $studentQuery = "SELECT name FROM users WHERE id = '$studentId'";
        $studentResult = mysqli_query($conn, $studentQuery);
        $studentName = "";

        if ($studentResult && mysqli_num_rows($studentResult) > 0) {
            $studentRow = mysqli_fetch_assoc($studentResult);
            $studentName = $studentRow['name'];
        }

        // Fetch course name from courses table
        $courseId = $row['course_id'];
        $courseQuery = "SELECT title FROM courses WHERE id = '$courseId'";
        $courseResult = mysqli_query($conn, $courseQuery);
        $courseName = "";

        if ($courseResult && mysqli_num_rows($courseResult) > 0) {
            $courseRow = mysqli_fetch_assoc($courseResult);
            $courseName = $courseRow['title'];
        }

        // Create the question array
        $question = array(
            'id' => $row['id'],
            'question' => $row['question'],
            'answer' => $row['answer'],
            'student_name' => $studentName,
            'course_name' => $courseName,
            'date' => $row['timestamp'],
        );

        $response['status'] = 0;
        $response['message'] = 'Question retrieved successfully.';
        $response['data'] = $question;
    } else {
        $response['status'] = 1;
        $response['message'] = 'No question found for the given ID.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Missing ID parameter.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
