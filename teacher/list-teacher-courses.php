<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Assuming you have established a database connection

// Check if the teacher ID is provided
if (isset($_GET['id'])) {
    $teacherId = mysql_entities_fix_string($conn, intval($_GET['id']));

    // Prepare the query to retrieve courses for the specified teacher
    $query = "SELECT c.id, c.title, c.description FROM courses c";
    $query .= " WHERE c.teacher_id = $teacherId";

    // Execute the query
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of courses.')));

    // Check if there are any courses
    if (mysqli_num_rows($result) > 0) {
        $response = array();
        $response['status'] = 0;
        $response['courses'] = array();

        // Loop through each row and fetch the course information
        while ($row = mysqli_fetch_assoc($result)) {
            $courseId = $row['id'];
            $courseTitle = $row['title'];
            $courseDescription = $row['description'];

            $response['courses'][] = array('id' => $courseId, 'title' => $courseTitle, 'description' => $courseDescription);
        }
    } else {
        // No courses found for the teacher
        $response['status'] = 1;
        $response['message'] = 'No Courses Found for the Specified Teacher';
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
