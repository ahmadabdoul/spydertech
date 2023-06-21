<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$username = '';
$password = '';
$fullname = '';
$email = '';
$cellphone = '';
$avatar = '';
$response = array();

// Getting the received JSON into $json variable.
$json = file_get_contents('php://input');

// decoding the received JSON and store into $obj variable.
$obj = json_decode($json, true);

// Sanitize and validate inputs
$email = mysql_entities_fix_string($conn, $obj['email']);
$password = mysql_entities_fix_string($conn, $obj['password']);
$fullname = mysql_entities_fix_string($conn, $obj['fullname']);
$username = mysql_entities_fix_string($conn, $obj['username']);
$cellphone = mysql_entities_fix_string($conn, $obj['cellphone']);


// Perform registration validation
if (empty($email) || empty($password) || empty($fullname) || empty($username) || empty($cellphone)) {
  $response['status'] = 1;
  $response['message'] = 'Please enter all required fields.';
} else {
  // Check if the email is already registered
  $query = "SELECT * FROM users WHERE email = '$email' OR username = '$username'";
  $result = mysqli_query($conn, $query);

  if ($result && mysqli_num_rows($result) > 0) {
    $response['status'] = 1;
    $response['message'] = 'Email or username already registered. Please use a different email address.';
  } else {
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user into the database
   $insertQuery = "INSERT INTO users (email, password, name, username, cellphone) VALUES ('$email', '$hashedPassword', '$fullname', '$username', '$cellphone')";
    $insertResult = mysqli_query($conn, $insertQuery) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during registration. Please try again later.')));
    if ($insertResult) {
      $query = "SELECT * FROM users WHERE username = '$username'";
  $result = mysqli_query($conn, $query);

  if ($result && mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
  }
      $response['status'] = 0;
      $response['message'] = 'Registration successful.';
      $response['user'] = $row;
    } else {
      $response['status'] = 1;
      $response['message'] = 'Error occurred during registration. Please try again later.';
    }
  }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
