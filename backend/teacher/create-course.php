<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Check if the user is logged in and has the necessary privileges
// Add your authentication and authorization logic here

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Validate the required fields
if (isset($obj['title']) && isset($obj['description']) && isset($obj['teacher_id'])) {
    // Sanitize input data
    $title = mysql_entities_fix_string($conn, $obj['title']);
    $description = mysql_entities_fix_string($conn, $obj['description']);
    $teacher_id = mysql_entities_fix_string($conn, $obj['teacher_id']);

    // Insert the new course into the database
    $query = "INSERT INTO courses (title, description, teacher_id) VALUES ('$title', '$description', '$teacher_id')";
    $result = mysqli_query($conn, $query);

    if ($result) {
        $response['status'] = 0;
        $response['message'] = 'Course created successfully.';
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error occurred while creating the course.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Required fields are missing.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
