<?php
session_start(); // Start the session at the very beginning
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
if($obj){
  $username = mysql_entities_fix_string($conn, $obj['username']);
  $password = mysql_entities_fix_string($conn, $obj['password']);
}else{
  $response['status'] = 1;
  $response['message'] = 'Invalid request format.';
  echo json_encode($response);
  exit();
}

// Perform login validation
if (empty($username) || empty($password)) {
  $response['status'] = 1;
  $response['message'] = 'Please enter both username and password.';
} else {
  // Query the database to check if the username exists
  $query = "SELECT * FROM users WHERE username = ?";
  $stmt = mysqli_prepare($conn, $query);
  mysqli_stmt_bind_param($stmt, "s", $username);
  mysqli_stmt_execute($stmt);
  $result = mysqli_stmt_get_result($stmt);

  if ($result && mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    
    // Verify the hashed password
    if (password_verify($password, $row['password'])) {
      // Login successful
      // Store user ID in session
      $_SESSION['user_id'] = $row['id'];

      $response['status'] = 0;
      $response['message'] = 'Login successful.';
      // Manually build the user array to ensure all required fields are present
      $response['user'] = array(
        'id' => $row['id'],
        'name' => $row['name'],
        'username' => $row['username'],
        'email' => $row['email'],
        'cellphone' => $row['cellphone'],
        'avatar' => $row['avatar'],
        'wallet_balance' => $row['wallet_balance']
      );
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
  mysqli_stmt_close($stmt);
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>