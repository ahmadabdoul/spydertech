<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Assuming you have established a database connection

// Check if the student ID is provided
if (isset($_GET['id'])) {
    $studentId = mysql_entities_fix_string($conn, intval($_GET['id']));

    // Prepare the query to retrieve the student information
    $query = "SELECT * FROM users WHERE id = $studentId";

    // Execute the query
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of student information.')));

    // Check if the student exists
    if (mysqli_num_rows($result) > 0) {
        $student = mysqli_fetch_assoc($result);
        
        $response = array();
        $response['status'] = 0;
        $response['student'] = array(
            'id' => $student['id'],
            'username' => $student['username'],
            'email' => $student['email']
        );

        // Retrieve the enrolled courses and completion status
        $coursesQuery = "SELECT c.id, c.title, sc.completion_status FROM courses c";
        $coursesQuery .= " INNER JOIN student_courses sc ON c.id = sc.course_id";
        $coursesQuery .= " WHERE sc.student_id = $studentId";
        $coursesResult = mysqli_query($conn, $coursesQuery) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of enrolled courses.')));

        // Check if there are any enrolled courses
        if (mysqli_num_rows($coursesResult) > 0) {
            $response['courses'] = array();

            // Loop through each row and fetch the course information and completion status
            while ($courseRow = mysqli_fetch_assoc($coursesResult)) {
                $courseId = $courseRow['id'];
                $courseTitle = $courseRow['title'];
                $completionStatus = $courseRow['completion_status'];

                $response['courses'][] = array('id' => $courseId, 'title' => $courseTitle, 'completion_status' => $completionStatus);
            }
        }
    } else {
        // Student not found
        $response['status'] = 1;
        $response['message'] = 'Student Not Found';
    }
} else {
    // Student ID not provided
    $response['status'] = 1;
    $response['message'] = 'Student ID not provided';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
