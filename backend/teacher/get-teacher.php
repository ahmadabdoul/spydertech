<?php

// Assuming you have established a database connection
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Check if the teacher ID is provided
if (isset($_GET['id'])) {
    $teacherId = mysql_entities_fix_string($conn, intval($_GET['id']));

    // Prepare the query to retrieve the teacher information
    $query = "SELECT * FROM teachers WHERE id = $teacherId";

    // Execute the query
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of teacher information.')));

    // Check if the teacher exists
    if (mysqli_num_rows($result) > 0) {
        $teacher = mysqli_fetch_assoc($result);
        
        $response = array();
        $response['status'] = 0;
        $response['teacher'] = array(
            'id' => $teacher['id'],
            'username' => $teacher['username'],
            'email' => $teacher['email']
        );

        // Retrieve the courses taught by the teacher
        $coursesQuery = "SELECT c.id, c.title, c.description FROM courses c";
        $coursesQuery .= " WHERE c.teacher_id = $teacherId";
        $coursesResult = mysqli_query($conn, $coursesQuery) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of courses.')));

        // Check if there are any courses
        if (mysqli_num_rows($coursesResult) > 0) {
            $response['courses'] = array();

            // Loop through each row and fetch the course information
            while ($courseRow = mysqli_fetch_assoc($coursesResult)) {
                $courseId = $courseRow['id'];
                $courseTitle = $courseRow['title'];
                $courseDescription = $courseRow['description'];

                $response['courses'][] = array('id' => $courseId, 'title' => $courseTitle, 'description' => $courseDescription);
            }
        }
    } else {
        // Teacher not found
        $response['status'] = 1;
        $response['message'] = 'Teacher Not Found';
    }
} else {
    // Teacher ID not provided
    $response['status'] = 1;
    $response['message'] = 'Teacher ID not provided';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
