<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$response = array();

// Check if student_id is provided in GET parameters
if (isset($_GET['student_id'])) {
    // Sanitize student_id
    $student_id_raw = $_GET['student_id'];
    $student_id = mysql_entities_fix_string($conn, $student_id_raw);

    // Validate that sanitized student_id is not empty
    if (!empty($student_id)) {
        // Construct the SQL query to retrieve user profile details
        $query = "SELECT name, username, email, cellphone, avatar, wallet_balance
                  FROM users
                  WHERE id = '$student_id'";

        $result = mysqli_query($conn, $query);

        if ($result) {
            if (mysqli_num_rows($result) > 0) {
                $user_profile = mysqli_fetch_assoc($result);
                // Optionally, ensure numeric types are cast if necessary by client
                // $user_profile['wallet_balance'] = floatval($user_profile['wallet_balance']);

                $response['status'] = 0;
                $response['profile'] = $user_profile;
            } else {
                $response['status'] = 1;
                $response['message'] = 'User not found.';
            }
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error fetching user profile: ' . mysqli_error($conn);
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Student ID cannot be empty after sanitization.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Student ID not provided.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
