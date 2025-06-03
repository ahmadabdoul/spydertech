<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';


// Get the limit parameter from the URL
$limit = isset($_GET['limit']) ? mysql_entities_fix_string($conn, $_GET['limit']) : 'all';
$response = array();

// Construct the query to retrieve courses with optional limit
$query = "SELECT c.*, t.username AS teacher_username FROM courses c";
$query .= " LEFT JOIN teachers t ON c.teacher_id = t.id";

// Check if a specific limit is provided
if ($limit !== 'all' && is_numeric($limit)) {
    $query .= " LIMIT " . intval($limit);
}

// Retrieve courses from the database
$result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of courses.')));

// Check if there are any courses
if (mysqli_num_rows($result) > 0) {
    $response['status'] = 0;
    // Loop through each row and display course information
    while ($row = mysqli_fetch_assoc($result)) {
        $courseId = $row['id'];
        $courseTitle = $row['title'];
        $courseDescription = $row['description'];
        $teacherUsername = $row['teacher_username'];
       
        $response['courses'][] = array('id' => $courseId, 'title' => $courseTitle, 'description' => $courseDescription, 'teacher_username' => $teacherUsername);

       
    }
} else {

    // Invalid username
    $response['status'] = 1;
    $response['message'] = 'No Courses Found';
  }


// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
// Close the database connection
mysqli_close($conn);
?>
