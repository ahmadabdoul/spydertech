<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Check if the user is logged in and has the necessary privileges
// Add your authentication and authorization logic here

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Validate the required fields
if (isset($obj['course_id']) && isset($obj['title']) && isset($obj['content'])) {
    // Sanitize input data
    $course_id = mysql_entities_fix_string($conn, $obj['course_id']);
    $title = mysql_entities_fix_string($conn, $obj['title']);
    $content = mysql_entities_fix_string($conn, $obj['content']);
    
    // Check if the content is a URL or a file
    if (isset($obj['video_type']) && $obj['video_type'] == 'url') {
        // Content is a URL, insert it directly into the database
        $url = $obj['url'];
        $query = "INSERT INTO course_content (course_id, title, content, video_url) VALUES ('$course_id', '$title', '$content', '$url')";
        $result = mysqli_query($conn, $query);

        if ($result) {
            $response['status'] = 0;
            $response['message'] = 'Course content (URL) uploaded successfully.';
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error occurred while uploading the course content (URL).';
        }
    } elseif (isset($_FILES['file'])) {
        // Content is a file, upload it to the server
        $file = $_FILES['file'];
        $target_dir = '../uploads/';  // Specify the directory where you want to save the uploaded files
        $target_file = $target_dir . basename($file['name']);
        $fileType = pathinfo($target_file, PATHINFO_EXTENSION);

        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            // File uploaded successfully, insert the course content into the database
            $query = "INSERT INTO course_content (course_id, title, content, video_url) VALUES ('$course_id', '$title', '$content', '$target_file')";
            $result = mysqli_query($conn, $query);

            if ($result) {
                $response['status'] = 0;
                $response['message'] = 'Course content (file) uploaded successfully.';
            } else {
                $response['status'] = 1;
                $response['message'] = 'Error occurred while uploading the course content (file).';
            }
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error occurred while uploading the file.';
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Required fields are missing.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Required fields are missing.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
