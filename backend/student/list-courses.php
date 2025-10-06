<?php
session_start();
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Get the limit parameter from the URL
$limit = isset($_GET['limit']) ? mysql_entities_fix_string($conn, $_GET['limit']) : 'all';
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

$response = array();

// Base query
$query = "SELECT c.id, c.title, c.description, c.teacher_id, c.enrollment_fee, c.certificate_fee, t.username AS teacher_username";

// If a user is logged in, join with student_courses to get their enrollment status
if ($userId) {
    $query .= ", sc.completion_status AS enrollment_status ";
    $query .= " FROM courses c";
    $query .= " LEFT JOIN teachers t ON c.teacher_id = t.id";
    $query .= " LEFT JOIN student_courses sc ON c.id = sc.course_id AND sc.student_id = " . intval($userId);
} else {
    $query .= " FROM courses c";
    $query .= " LEFT JOIN teachers t ON c.teacher_id = t.id";
}

// Check if a specific limit is provided
if ($limit !== 'all' && is_numeric($limit)) {
    $query .= " LIMIT " . intval($limit);
}

// Retrieve courses from the database
$result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of courses.')));

// Check if there are any courses
if (mysqli_num_rows($result) > 0) {
    $response['status'] = 0;
    $response['courses'] = array();
    // Loop through each row and display course information
    while ($row = mysqli_fetch_assoc($result)) {
        $enrollment_status = 'Not Enrolled'; // Default status
        if ($userId && !empty($row['enrollment_status'])) {
            $enrollment_status = $row['enrollment_status'];
        }

        $response['courses'][] = array(
            'id' => $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'teacher_username' => $row['teacher_username'],
            'enrollment_fee' => $row['enrollment_fee'],
            'certificate_fee' => $row['certificate_fee'],
            'enrollment_status' => $enrollment_status
        );
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'No Courses Found';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
// Close the database connection
mysqli_close($conn);
?>