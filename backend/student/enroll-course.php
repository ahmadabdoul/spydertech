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


if($obj){

  $courseId = $obj['courseId'] ?  mysql_entities_fix_string($conn, $obj['courseId']) : $_GET['courseId'];
$userId = $obj['userId'] ?  mysql_entities_fix_string($conn, $obj['userId']) : $_GET['userId'];

// Check if the user is already enrolled in the course
$query = "SELECT * FROM student_courses WHERE course_id = $courseId AND student_id = $userId";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
    // User is already enrolled in the course
    $response = array(
        'status' => 1,
        'message' => 'You are already enrolled in this course.'
    );
} else {
    // User is not enrolled in the course, enroll them
    $enrollQuery = "INSERT INTO student_courses (course_id, student_id, completion_status, start_date) VALUES ($courseId, $userId, 'In Progress', NOW())";
    $enrollResult = mysqli_query($conn, $enrollQuery) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during enrollment of course.'.mysqli_error($conn))));

    if ($enrollResult) {
        // Course enrollment successful
        $response = array(
            'status' => 0,
            'message' => 'Course enrollment successful.'
        );
    } else {
        // Course enrollment failed
        $response = array(
            'status' => 1,
            'message' => 'Course enrollment failed. Please try again later.'
        );
    }
}
}else{
  $response = array(
            'status' => 1,
            'message' => 'Course enrollment failed. Please try again later.'
        );
}


// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
