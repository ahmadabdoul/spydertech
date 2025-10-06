<?php
// Set content type to JSON and start session
header('Content-Type: application/json');
session_start();

// Include dependencies
require_once '../assets/connection.php';
require_once '../assets/inject.php'; // For mysql_entities_fix_string

// Initialize response
$response = array();

// Check for Course ID
if (!isset($_GET['courseId'])) {
    $response['status'] = 1;
    $response['message'] = 'Course ID is required.';
    echo json_encode($response);
    exit();
}

// Sanitize the Course ID
$courseId = mysql_entities_fix_string($conn, $_GET['courseId']);

// 1. Fetch Course Details
$query_course_details = "SELECT title, certificate_fee FROM courses WHERE id = ?";
$stmt_details = mysqli_prepare($conn, $query_course_details);
mysqli_stmt_bind_param($stmt_details, "i", $courseId);
mysqli_stmt_execute($stmt_details);
$result_details = mysqli_stmt_get_result($stmt_details);

if ($result_details && mysqli_num_rows($result_details) > 0) {
    $response['course_details'] = mysqli_fetch_assoc($result_details);
} else {
    $response['status'] = 1;
    $response['message'] = 'Course details not found.';
    echo json_encode($response);
    exit();
}
mysqli_stmt_close($stmt_details);


// 2. Fetch all course content items, ensuring 'chapter_title' is selected
$query_contents = "SELECT id, course_id, title, chapter_title, content, video_type, video_url FROM course_content WHERE course_id = ?";
$stmt_contents = mysqli_prepare($conn, $query_contents);
mysqli_stmt_bind_param($stmt_contents, "i", $courseId);
mysqli_stmt_execute($stmt_contents);
$result_contents = mysqli_stmt_get_result($stmt_contents);

$course_contents = array();
if ($result_contents) {
    while ($row = mysqli_fetch_assoc($result_contents)) {
        $course_contents[] = $row;
    }
}
$response['course_contents'] = $course_contents;
mysqli_stmt_close($stmt_contents);


// 3. Fetch Questions and Answers for the course
$query_qa = "SELECT question, answer FROM course_qa WHERE course_id = ?";
$stmt_qa = mysqli_prepare($conn, $query_qa);
mysqli_stmt_bind_param($stmt_qa, "i", $courseId);
mysqli_stmt_execute($stmt_qa);
$result_qa = mysqli_stmt_get_result($stmt_qa);

$questions_answers = array();
if ($result_qa) {
    while ($row = mysqli_fetch_assoc($result_qa)) {
        $questions_answers[] = $row;
    }
}
$response['questions_answers'] = $questions_answers;
mysqli_stmt_close($stmt_qa);


// Final successful response
$response['status'] = 0;
$response['message'] = 'Course content fetched successfully.';

// Return JSON response
echo json_encode($response);

// Close the database connection
mysqli_close($conn);

?>