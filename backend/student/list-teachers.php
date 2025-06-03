<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Assuming you have established a database connection

// Prepare the query to retrieve all teachers
$query = "SELECT * FROM teachers";

// Execute the query
$result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of teachers.')));

// Check if there are any teachers
if (mysqli_num_rows($result) > 0) {
    $response = array();
    $response['status'] = 0;
    $response['teachers'] = array();

    // Loop through each row and fetch the teacher information
    while ($row = mysqli_fetch_assoc($result)) {
        $teacherId = $row['id'];
        $teacherUsername = $row['username'];
        $teacherEmail = $row['email'];

        $response['teachers'][] = array('id' => $teacherId, 'username' => $teacherUsername, 'email' => $teacherEmail);
    }
} else {
    // No teachers found
    $response['status'] = 1;
    $response['message'] = 'No Teachers Found';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
