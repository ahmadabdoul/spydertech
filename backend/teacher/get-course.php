<?php
require_once '../assets/connection.php';

// Retrieve the course ID from the request
$courseId = $_GET['id'];

// Retrieve course details
$query = "SELECT title, description FROM courses WHERE id = $courseId";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
    $course = mysqli_fetch_assoc($result);

    // Retrieve course contents
    $query = "SELECT title, content, video_url FROM course_content WHERE course_id = $courseId";
    $result = mysqli_query($conn, $query);
    $status = 0;
    $courseContents = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $courseContents[] = $row;
    }

    // Retrieve students enrolled and completion status
    $query = "SELECT COUNT(*) AS students_enrolled FROM student_courses WHERE course_id = $courseId";
    $result = mysqli_query($conn, $query);
    $studentsEnrolled = mysqli_fetch_assoc($result)['students_enrolled'];

    $query = "SELECT COUNT(*) AS completion_status FROM student_courses WHERE course_id = $courseId AND completion_status = 'Completed'";
    $result = mysqli_query($conn, $query);
    $completionStatus = mysqli_fetch_assoc($result)['completion_status'];

    // Calculate completion rate
    $completionRate = ($studentsEnrolled > 0) ? ($completionStatus / $studentsEnrolled) * 100 : 0;
    $completionRate = round($completionRate, 2);
    // Retrieve student details and build students enrolled array
    $query = "SELECT sc.student_id, sc.completion_status, sc.start_date, u.name AS student_name
    FROM student_courses sc
    JOIN users u ON sc.student_id = u.id
    WHERE sc.course_id = $courseId";

    $result = mysqli_query($conn, $query);
    $studentsEnrolledArray = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $student = array(
            'student_id' => $row['student_id'],
            'completion_status' => $row['completion_status'],
            'start_date' => $row['start_date'],
            'name' => $row['student_name']
        );
        $studentsEnrolledArray[] = $student;
    }

    // Prepare the response
    $response = array(
        'status' => $status,
        'title' => $course['title'],
        'description' => $course['description'],
        'course_contents' => $courseContents,
        'students_enrolled' => array(
            'count' => $studentsEnrolled,
            'data' => $studentsEnrolledArray
        ),
        'completion_rate' => $completionRate
    );
} else {
    $response = array('status'=>1, 'message' => 'Course not found.');
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
