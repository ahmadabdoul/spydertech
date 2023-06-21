<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Initialize variables
$id = '';
$title = '';
$description = '';

$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

// Sanitize and validate inputs
$id = mysql_entities_fix_string($conn, $obj['id']) ? mysql_entities_fix_string($conn, $obj['id']) : mysql_entities_fix_string($conn, $_GET['id']);
$title = mysql_entities_fix_string($conn, $obj['title']) ? mysql_entities_fix_string($conn, $obj['title']) : mysql_entities_fix_string($conn, $_GET['title']);
$description = mysql_entities_fix_string($conn, $obj['description']) ? mysql_entities_fix_string($conn, $obj['description']) : mysql_entities_fix_string($conn, $_GET['description']);

if($id && $title && $description){
    $query = "UPDATE courses SET title = '$title', description = '$description' WHERE id = $id";
    $result = mysqli_query($conn, $query);
    if ($result) {
        $response['status'] = 0;
        $response['message'] = 'Course updated successfully.';
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error occurred while updating the course.';
    }
   
}else{
    $response['status'] = 1;
    $response['message'] = 'Info not provided.';
    }

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($conn);





