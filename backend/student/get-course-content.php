<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$courseId = '';
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Check if the courseId is provided
if (isset($obj['courseId']) || isset($_GET['courseId'])) {
    $courseId = isset($obj['courseId']) ? mysql_entities_fix_string($conn, $obj['courseId']) : mysql_entities_fix_string($conn, $_GET['courseId']);

    // Retrieve course details
    $query = "SELECT * FROM courses WHERE id = $courseId";
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of course details.')));

    if (mysqli_num_rows($result) > 0) {
        $response['status'] = 0;
        $course = mysqli_fetch_assoc($result);

        // Retrieve teacher details
        $teacherId = $course['teacher_id'];
        $teacherQuery = "SELECT * FROM teachers WHERE id = $teacherId";
        $teacherResult = mysqli_query($conn, $teacherQuery) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of teacher details.')));

        if (mysqli_num_rows($teacherResult) > 0) {
            $teacher = mysqli_fetch_assoc($teacherResult);
            $course['teacher_name'] = $teacher['name'];
        }

        $response['course_details'] = $course;
    } else {
        $response['status'] = 1;
        $response['message'] = 'Course not found.';
    }

    // Retrieve questions and answers for the course
    $query = "SELECT * FROM course_qa WHERE course_id = $courseId";
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of questions and answers.')));

    if (mysqli_num_rows($result) > 0) {
        $response['status'] = 0;
        $questions_answers = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $questions_answers[] = $row;
        }
        $response['questions_answers'] = $questions_answers;
    } else {
        $response['status'] = 1;
        $response['message'] = 'No questions and answers found for the course.';
    }

    // Retrieve course contents/lists
    $query = "SELECT id, course_id, title, chapter_title, content, video_url, video_type FROM course_content WHERE course_id = $courseId ORDER BY chapter_title, id ASC";
    $result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of course contents.')));

    if (mysqli_num_rows($result) > 0) {
        $response['status'] = 0;
        $course_contents = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $course_contents[] = $row;
        }
        $response['course_contents'] = $course_contents;
    } else {
        $response['status'] = 1;
        $response['message'] = 'No course contents found for the course.';
    }
} else {
    $response = array(
        'status' => 1,
        'message' => 'Course ID not provided.'
    );
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
