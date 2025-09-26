<?php

$servername = 'localhost';
$username = "spidert5_root";
// TODO: Replace with your actual database password
$password = "db_password";
$dbname = "spidert5__spydertech";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    // Using die() is simple but can expose sensitive info.
    // In a production environment, it's better to log this error and show a generic message to the user.
    die("Connection failed: " . mysqli_connect_error());
}
