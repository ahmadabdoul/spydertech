<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Validate the required fields
if ((isset($obj['course_id'], $obj['title'], $obj['content']) && !empty($obj['course_id']) && !empty($obj['title']) && !empty($obj['content'])) ||
    (isset($_POST['course_id'], $_POST['title'], $_POST['content']) && !empty($_POST['course_id']) && !empty($_POST['title']) && !empty($_POST['content']))) {
    // Sanitize input data
    $course_id = isset($obj['course_id']) ? mysql_entities_fix_string($conn, $obj['course_id']) : mysql_entities_fix_string($conn, $_POST['course_id']);
    $title = isset($obj['title']) ? mysql_entities_fix_string($conn, $obj['title']) : mysql_entities_fix_string($conn, $_POST['title']);
    $content = isset($obj['content']) ? mysql_entities_fix_string($conn, $obj['content']) : mysql_entities_fix_string($conn, $_POST['content']);
    
    // Check if the content is a URL or a file
    if (isset($obj['video_type']) && $obj['video_type'] === 'url') {
        // Content is a URL, insert it directly into the database
        $url = isset($obj['url']) ? $obj['url'] : '';
        $query = "INSERT INTO course_content (course_id, title, content, video_url) VALUES ('$course_id', '$title', '$content', '$url')";
        $result = mysqli_query($conn, $query);

        if ($result) {
            $response['status'] = 0;
            $response['message'] = 'Course content (URL) uploaded successfully.';
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error occurred while uploading the course content (URL).';
        }
    } elseif (isset($_FILES['video'])) {
        // Content is a file, upload it to the server
        $file = $_FILES['video'];
        $target_dir = '../uploads/';  // Specify the directory where you want to save the uploaded files
        $target_file = $target_dir . basename($file['name']);
        $fileType = pathinfo($target_file, PATHINFO_EXTENSION);

        if (move_uploaded_file($file['tmp_name'], $target_file) && $file['error'] === UPLOAD_ERR_OK) {
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
            $uploadErrors = array(
                UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
                UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.',
                UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded.',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder.',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.'
            );
            
            $errorCode = $file['error'];
            $errorMessage = isset($uploadErrors[$errorCode]) ? $uploadErrors[$errorCode] : 'Unknown error occurred.';
            
            $response['status'] = 1;
            $response['message'] = 'Error occurred during file upload: ' . $errorMessage;
    
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
