<?php
session_start();
require_once '../assets/connection.php';
require_once '../assets/inject.php';

$response = array();

// Assuming the teacher's ID is stored in the session upon login
if (!isset($_SESSION['teacher_id'])) {
    $response = array('status' => 1, 'message' => 'Not authorized. Please log in.');
} else {
    $teacherId = $_SESSION['teacher_id'];

    $query = "SELECT
                t.id,
                t.amount,
                t.teacher_revenue,
                t.transaction_type,
                t.timestamp,
                c.title AS course_title,
                u.name AS student_name
              FROM transactions t
              JOIN courses c ON t.course_id = c.id
              JOIN users u ON t.student_id = u.id
              WHERE t.teacher_id = ?
              ORDER BY t.timestamp DESC";

    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $teacherId);

    if (mysqli_stmt_execute($stmt)) {
        $result = mysqli_stmt_get_result($stmt);
        $transactions = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $transactions[] = $row;
        }
        $response['status'] = 0;
        $response['transactions'] = $transactions;
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error fetching transactions: ' . mysqli_error($conn);
    }
    mysqli_stmt_close($stmt);
}

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($conn);
?>