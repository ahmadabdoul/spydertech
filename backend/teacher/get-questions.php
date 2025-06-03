<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize response
$response = array();

// Check if the 'id' parameter is provided
if (isset($_GET['id'])) {
    // Sanitize the 'id' parameter
    $teacherId = mysqli_real_escape_string($conn, $_GET['id']);

    // Fetch courses of the teacher from courses table
    $courseQuery = "SELECT id FROM courses WHERE teacher_id = '$teacherId'";
    $courseResult = mysqli_query($conn, $courseQuery);

    if ($courseResult && mysqli_num_rows($courseResult) > 0) {
        $questions = array(); // Initialize the questions array

        while ($courseRow = mysqli_fetch_assoc($courseResult)) {
            $courseId = $courseRow['id'];

            // Retrieve questions from course_qa table based on the course ID
            $query = "SELECT * FROM course_qa WHERE course_id = '$courseId'";
            $result = mysqli_query($conn, $query);

            if ($result && mysqli_num_rows($result) > 0) {
                while ($row = mysqli_fetch_assoc($result)) {
                    // Fetch student name from users table
                    $studentId = $row['student_id'];
                    $studentQuery = "SELECT name FROM users WHERE id = '$studentId'";
                    $studentResult = mysqli_query($conn, $studentQuery);
                    $studentName = "";

                    if ($studentResult && mysqli_num_rows($studentResult) > 0) {
                        $studentRow = mysqli_fetch_assoc($studentResult);
                        $studentName = $studentRow['name'];
                    }

                    // Create the questions array
                    $questions[] = array(
                        'id' => $row['id'],
                        'question' => $row['question'],
                        'answer' => $row['answer'],
                        'student_name' => $studentName,
                        'course_id' => $courseId,
                        'date' => $row['timestamp'],
                    );
                }
            }
        }

        $response['status'] = 0;
        $response['message'] = 'Questions retrieved successfully.';
        $response['questions'] = $questions;
    } else {
        $response['status'] = 1;
        $response['message'] = 'No courses found for the given teacher ID.';
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
