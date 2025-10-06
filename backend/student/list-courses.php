<?php
session_start();
require_once '../assets/connection.php';

$response = array();
$userId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;

// Base query
$query = "SELECT c.id, c.title, c.description, c.teacher_id, c.enrollment_fee, c.certificate_fee, t.username AS teacher_username";
$params = array();
$param_types = "";

if ($userId) {
    $query .= ", sc.completion_status AS enrollment_status ";
    $query .= " FROM courses c";
    $query .= " LEFT JOIN teachers t ON c.teacher_id = t.id";
    $query .= " LEFT JOIN student_courses sc ON c.id = sc.course_id AND sc.student_id = ?";
    $params[] = $userId;
    $param_types .= "i";
} else {
    $query .= " FROM courses c";
    $query .= " LEFT JOIN teachers t ON c.teacher_id = t.id";
}

// Prepare and execute the statement
$stmt = $conn->prepare($query);
if ($userId) {
    $stmt->bind_param($param_types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $response['status'] = 0;
    $response['courses'] = array();
    while ($row = $result->fetch_assoc()) {
        $enrollment_status = 'Not Enrolled';
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

$stmt->close();
header('Content-Type: application/json');
echo json_encode($response);
$conn->close();
?>