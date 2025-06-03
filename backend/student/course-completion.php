<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Initialize variables
$courseId = '';
$userId = '';
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Check if the courseId is provided
if (isset($obj['courseId']) || isset($_GET['courseId'])) {
    $courseId = isset($obj['courseId']) ? mysql_entities_fix_string($conn, $obj['courseId']) : mysql_entities_fix_string($conn, $_GET['courseId']);
    $user_id = isset($obj['user_id']) ? mysql_entities_fix_string($conn, $obj['user_id']) : mysql_entities_fix_string($conn, $_GET['user_id']);
   
    $sql = "UPDATE  `student_courses` SET `completion_status`='Completed',`end_date`=NOW() WHERE `course_id` = '$courseId' AND `student_id` = '$user_id'";
    $result = mysqli_query($conn, $sql) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of questions and answers.')));

    if ($result) {
        $response['status'] = 0;
        $response['message'] = 'Course completed successfully.';
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error occurred during completion of course.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Course and user id not provided.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>