<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Sanitize input data from JSON payload or POST data
$course_id = isset($obj['course_id']) ? mysql_entities_fix_string($conn, $obj['course_id']) : (isset($_POST['course_id']) ? mysql_entities_fix_string($conn, $_POST['course_id']) : null);
$title = isset($obj['title']) ? mysql_entities_fix_string($conn, $obj['title']) : (isset($_POST['title']) ? mysql_entities_fix_string($conn, $_POST['title']) : null);
$chapter_title = isset($obj['chapter_title']) ? mysql_entities_fix_string($conn, $obj['chapter_title']) : (isset($_POST['chapter_title']) ? mysql_entities_fix_string($conn, $_POST['chapter_title']) : null);
$content = isset($obj['content']) ? mysql_entities_fix_string($conn, $obj['content']) : (isset($_POST['content']) ? mysql_entities_fix_string($conn, $_POST['content']) : ''); // Default to empty string if not provided
$video_type = isset($obj['video_type']) ? mysql_entities_fix_string($conn, $obj['video_type']) : (isset($_POST['video_type']) ? mysql_entities_fix_string($conn, $_POST['video_type']) : null);
$url = isset($obj['url']) ? mysql_entities_fix_string($conn, $obj['url']) : (isset($_POST['url']) ? mysql_entities_fix_string($conn, $_POST['url']) : null);

// Validate the required fields
$is_core_data_present = !empty($course_id) && !empty($title) && !empty($chapter_title);
$is_text_content_present = !empty($content);
$is_video_url_present = ($video_type === 'url' && !empty($url));
$is_video_file_present = ($video_type === 'file' && isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK);

if ($is_core_data_present && ($is_text_content_present || $is_video_url_present || $is_video_file_present)) {
    $db_video_url = ''; // Initialize with empty string, will be NULL if not set and column allows NULL
    $db_video_type = ''; // Initialize with empty string

    if ($is_video_url_present) {
        $db_video_url = $url;
        $db_video_type = 'url';
    } elseif ($is_video_file_present) {
        $file = $_FILES['video'];
        $target_dir = '../uploads/';  // Specify the directory where you want to save the uploaded files
        $path_for_db = 'uploads/';  // Specify the path to retrieve the uploaded files

        // Generate a unique filename to prevent overwriting
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $unique_filename = uniqid('', true) . '.' . $file_extension;
        $target_file_on_server = $target_dir . $unique_filename;
        $db_video_url = $path_for_db . $unique_filename; // Path to store in DB

        if (move_uploaded_file($file['tmp_name'], $target_file_on_server)) {
            $db_video_type = 'file'; // Or use the sanitized $video_type if it's 'file'
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
            $errorMessage = isset($uploadErrors[$errorCode]) ? $uploadErrors[$errorCode] : 'Unknown error occurred during file move.';
            $response['status'] = 1;
            $response['message'] = 'Error occurred during file upload: ' . $errorMessage;
            // Output response and exit if file move fails
            header('Content-Type: application/json');
            echo json_encode($response);
            mysqli_close($conn);
            exit;
        }
    }

    // If content is empty and no video, this case should be prevented by validation.
    // If content is empty but video is present, $content will be an empty string.
    // If video is not present, $db_video_url and $db_video_type will be empty strings.
    // Database schema allows NULL for content and video_url, so empty strings are acceptable.
    // Or, explicitly set to NULL if preferred and DB column default is NULL:
    // $db_content_for_sql = !empty($content) ? "'$content'" : "NULL";
    // $db_video_url_for_sql = !empty($db_video_url) ? "'$db_video_url'" : "NULL";
    // $db_video_type_for_sql = !empty($db_video_type) ? "'$db_video_type'" : "NULL";

    $query = "INSERT INTO course_content (course_id, title, chapter_title, content, video_url, video_type) VALUES ('$course_id', '$title', '$chapter_title', '$content', '$db_video_url', '$db_video_type')";
    $result = mysqli_query($conn, $query);

    if ($result) {
        $response['status'] = 0;
        $response['message'] = 'Course content uploaded successfully.';
    } else {
        $response['status'] = 1;
        $response['message'] = 'Error occurred while saving course content to the database: ' . mysqli_error($conn);
    }
} else {
    $error_messages = [];
    if (empty($course_id)) $error_messages[] = 'Course ID is missing.';
    if (empty($title)) $error_messages[] = 'Title is missing.';
    if (empty($chapter_title)) $error_messages[] = 'Chapter Title is missing.';
    if (!$is_text_content_present && !$is_video_url_present && !$is_video_file_present) {
        $error_messages[] = 'Either content, a video URL, or a video file must be provided.';
    }
    if ($video_type === 'url' && empty($url) && !$is_text_content_present && !$is_video_file_present) {
         $error_messages[] = 'Video URL is missing when video type is URL and no other content is provided.';
    }
    if ($video_type === 'file' && (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) && !$is_text_content_present && !$is_video_url_present) {
        $error_messages[] = 'Video file is missing or has an error when video type is file and no other content is provided.';
    }

    $response['status'] = 1;
    $response['message'] = 'Required fields are missing or invalid: ' . implode(' ', $error_messages);
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
