<?php

$servername = 'localhost';
$username = "root";
$password = "";
$dbname = "lms";

$conn = mysqli_connect($servername, $username, $password, $dbname) or die("Error connecting to mysql server");
