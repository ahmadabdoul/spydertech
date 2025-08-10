<?php
require_once '../assets/connection.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (isset($data['id'])) {
        $contentId = $data['id'];

        $query = "DELETE FROM course_content WHERE id = ?";
        $stmt = mysqli_prepare($conn, $query);

        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "i", $contentId);

            if (mysqli_stmt_execute($stmt)) {
                if (mysqli_stmt_affected_rows($stmt) > 0) {
                    $response['status'] = 0;
                    $response['message'] = 'Content deleted successfully.';
                } else {
                    $response['status'] = 1;
                    $response['message'] = 'Content not found or already deleted.';
                }
            } else {
                $response['status'] = 1;
                $response['message'] = 'Error deleting content: ' . mysqli_stmt_error($stmt);
            }
            mysqli_stmt_close($stmt);
        } else {
            $response['status'] = 1;
            $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Content ID not provided.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Invalid request method.';
}

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($conn);
?>
