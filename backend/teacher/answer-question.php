<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize response
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$data = json_decode($json, true);

// Check if the 'id' and 'answer' parameters are provided
if (isset($data['id'], $data['answer'])) {
    // Sanitize the 'id' and 'answer' parameters
    $questionId = mysqli_real_escape_string($conn, $data['id']);
    $answer = mysqli_real_escape_string($conn, $data['answer']);

    // Update the answer in the database
    $query = "UPDATE course_qa SET answer = '$answer' WHERE id = '$questionId'";
    $result = mysqli_query($conn, $query);

    if ($result) {
        $response['status'] = 0;
        $response['message'] = 'Answer updated successfully.';
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error occurred while updating the answer.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Missing ID or answer parameter.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
