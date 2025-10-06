<?php
session_start();
require_once '../assets/connection.php';

$response = array();

if (!isset($_GET['id'])) {
    $response = array('status' => 1, 'message' => 'Teacher ID not provided');
    echo json_encode($response);
    exit();
}

$teacherId = intval($_GET['id']);

// Prepare the query to retrieve the teacher information
$stmt = $conn->prepare("SELECT id, username, email, wallet_balance, revenue_percentage FROM teachers WHERE id = ?");
$stmt->bind_param("i", $teacherId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $teacher = $result->fetch_assoc();

    $response['status'] = 0;
    $response['teacher'] = array(
        'id' => $teacher['id'],
        'username' => $teacher['username'],
        'email' => $teacher['email'],
        'wallet_balance' => $teacher['wallet_balance'],
        'revenue_percentage' => $teacher['revenue_percentage']
    );
    $stmt->close();

    // Retrieve the courses taught by the teacher
    $stmt_courses = $conn->prepare("SELECT id, title, description FROM courses WHERE teacher_id = ?");
    $stmt_courses->bind_param("i", $teacherId);
    $stmt_courses->execute();
    $coursesResult = $stmt_courses->get_result();

    if ($coursesResult->num_rows > 0) {
        $response['courses'] = array();
        while ($courseRow = $coursesResult->fetch_assoc()) {
            $response['courses'][] = $courseRow;
        }
    }
    $stmt_courses->close();
} else {
    // Teacher not found
    $response['status'] = 1;
    $response['message'] = 'Teacher Not Found';
    $stmt->close();
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
$conn->close();
?>