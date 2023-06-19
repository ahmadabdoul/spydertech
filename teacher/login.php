<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$username = '';
$password = '';
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Sanitize and validate inputs

$username = mysql_entities_fix_string($conn, $obj['username']) ? mysql_entities_fix_string($conn, $obj['username']) : mysql_entities_fix_string($conn, $_GET['username']);
$password = mysql_entities_fix_string($conn, $obj['password']) ? mysql_entities_fix_string($conn, $obj['password']) : mysql_entities_fix_string($conn, $_GET['password']);


// Perform login validation
if (empty($username) || empty($password)) {
  $response['status'] = 1;
  $response['message'] = 'Please enter both username and password.';
} else {
  // Query the database to check if the username exists
  $query = "SELECT * FROM teachers WHERE username = '$username'";
  $result = mysqli_query($conn, $query);

  if ($result && mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    
    // Verify the hashed password
    if (password_verify($password, $row['password'])) {
      // Login successful
      $response['status'] = 0;
      $response['message'] = 'Login successful.';
      $response['user'] = $row;
    } else {
      // Invalid password
      $response['status'] = 1;
      $response['message'] = 'Invalid username or password.';
    }
  } else {
    // Invalid username
    $response['status'] = 1;
    $response['message'] = 'Invalid username or password.';
  }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
