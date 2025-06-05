<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$courseId = '';
$response = array(
    'status' => 1, // Default to error
    'message' => 'Course ID not provided or an initial error occurred.',
    'course_details' => null,
    'questions_answers' => array(),
    'course_contents' => array(),
    'qa_message' => '' // Specific message for Q&A status
);

// Retrieve the JSON payload
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

// Check if the courseId is provided
if (isset($obj['courseId']) || isset($_GET['courseId'])) {
    $courseId = isset($obj['courseId']) ? mysql_entities_fix_string($conn, $obj['courseId']) : mysql_entities_fix_string($conn, $_GET['courseId']);

    // Retrieve course details
    $query_course = "SELECT * FROM courses WHERE id = '$courseId'";
    $result_course = mysqli_query($conn, $query_course);

    if ($result_course && mysqli_num_rows($result_course) > 0) {
        $course = mysqli_fetch_assoc($result_course);

        // Retrieve teacher details
        $teacherId = $course['teacher_id'];
        $teacherQuery = "SELECT name FROM teachers WHERE id = '$teacherId'";
        $teacherResult = mysqli_query($conn, $teacherQuery);
        if ($teacherResult && mysqli_num_rows($teacherResult) > 0) {
            $teacher = mysqli_fetch_assoc($teacherResult);
            $course['teacher_name'] = $teacher['name'];
        } else {
            $course['teacher_name'] = 'N/A'; // Default if teacher not found
        }
        $response['course_details'] = $course;
        $response['status'] = 0; // Success: Course details were found
        $response['message'] = 'Course details retrieved successfully.';
    } else {
        // If course details are not found, this is a fundamental error for this script's purpose.
        $response['status'] = 1;
        $response['message'] = 'Course not found or an error occurred while retrieving its details.';
        // Output JSON and exit early
        header('Content-Type: application/json');
        echo json_encode($response);
        mysqli_close($conn);
        exit;
    }

    // Retrieve questions and answers for the course
    $query_qa = "SELECT * FROM course_qa WHERE course_id = '$courseId'";
    $result_qa = mysqli_query($conn, $query_qa);

    if ($result_qa && mysqli_num_rows($result_qa) > 0) {
        $questions_answers_data = array();
        while ($row_qa = mysqli_fetch_assoc($result_qa)) {
            $questions_answers_data[] = $row_qa;
        }
        $response['questions_answers'] = $questions_answers_data;
        // Do not change overall status here; finding Q&A is optional for the main success criteria of fetching content
    } else {
        $response['qa_message'] = 'No questions and answers found for this course.';
    }

    // Retrieve course contents/lists (chapters, videos, etc.)
    $query_content = "SELECT id, course_id, title, chapter_title, content, video_url, video_type FROM course_content WHERE course_id = '$courseId' ORDER BY chapter_title, id ASC";
    $result_content = mysqli_query($conn, $query_content);

    if ($result_content && mysqli_num_rows($result_content) > 0) {
        $course_contents_data = array();
        while ($row_content = mysqli_fetch_assoc($result_content)) {
            $course_contents_data[] = $row_content;
        }
        $response['course_contents'] = $course_contents_data;
        // Status is already 0 if course details were found. Message should reflect overall success.
        $response['message'] = 'Course details and content retrieved successfully.';
    } else {
        // If no course content items are found, but course details were retrieved,
        // the status remains 0 (success in retrieving the main course entity).
        // The message should indicate that course details were found, but specific content items are missing.
        // The frontend JavaScript (`course-content.js`) is expected to handle an empty `course_contents` array
        // by displaying a message like "No chapters available."
        $response['message'] = 'Course details retrieved, but no specific content items (e.g., chapters or videos) are available for this course.';
    }

} else {
    // Course ID was not provided. The initial status (1) and message correctly reflect this.
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
