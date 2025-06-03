<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$courseId = '';
$user_id = '';
$question = '';
$response = array();

// Getting the received JSON into $json variable.
$json = file_get_contents('php://input');

// decoding the received JSON and store into $obj variable.
$obj = json_decode($json, true);


// Check if the courseId is provided
if (isset($obj['courseId']) || isset($_GET['courseId'])) {
    $courseId = isset($obj['courseId']) ? mysql_entities_fix_string($conn, $obj['courseId']) : mysql_entities_fix_string($conn, $_GET['courseId']);
    $user_id = isset($obj['user_id']) ? mysql_entities_fix_string($conn, $obj['user_id']) : mysql_entities_fix_string($conn, $_GET['user_id']);
    $question = isset($obj['question']) ? mysql_entities_fix_string($conn, $obj['question']) : mysql_entities_fix_string($conn, $_GET['question']);
    
    $sql = "INSERT INTO `course_qa`(`course_id`, `student_id`, `question`) VALUES ('$courseId','$user_id','$question')";
    $result = mysqli_query($conn, $sql) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of questions and answers.')));
    if ($result) {
        $response['status'] = 0;
        $response['message'] = 'Question submitted successfully.';
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error occurred during submission of question.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Question, Course and user id not provided.';
}


// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>