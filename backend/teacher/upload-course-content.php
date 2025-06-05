<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// --- Input Extraction and Validation ---
$course_id_raw = isset($obj['course_id']) ? $obj['course_id'] : (isset($_POST['course_id']) ? $_POST['course_id'] : null);
$title_raw = trim(isset($obj['title']) ? $obj['title'] : (isset($_POST['title']) ? $_POST['title'] : ''));
$chapter_title_raw = trim(isset($obj['chapter_title']) ? $obj['chapter_title'] : (isset($_POST['chapter_title']) ? $_POST['chapter_title'] : ''));
$content_raw = trim(isset($obj['content']) ? $obj['content'] : (isset($_POST['content']) ? $_POST['content'] : ''));
$video_type_input = trim(isset($obj['video_type']) ? $obj['video_type'] : (isset($_POST['video_type']) ? $_POST['video_type'] : ''));
$url_input = trim(isset($obj['url']) ? $obj['url'] : (isset($_POST['url']) ? $_POST['url'] : ''));

$course_id = filter_var($course_id_raw, FILTER_VALIDATE_INT);

$is_core_data_present = $course_id !== false && !empty($title_raw) && !empty($chapter_title_raw);
$is_text_content_present = !empty($content_raw);
$is_video_url_provided = ($video_type_input === 'url' && !empty($url_input));
$is_video_file_provided = ($video_type_input === 'file' && isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK);

if ($is_core_data_present && ($is_text_content_present || $is_video_url_provided || $is_video_file_provided)) {

    $db_content_final = !empty($content_raw) ? $content_raw : NULL;
    $db_video_url_final = NULL;
    $db_video_type_final = ''; // video_type is NOT NULL in DB, so empty string if no video

    if ($is_video_url_provided) {
        $db_video_url_final = $url_input; // Already trimmed
        $db_video_type_final = 'url'; // Use validated type
    } elseif ($is_video_file_provided) {
        $file = $_FILES['video'];
        $target_dir = '../uploads/';
        $path_for_db = 'uploads/';

        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)); // Lowercase extension
        $unique_filename = uniqid('vid_', true) . '.' . $file_extension; // Prefix with vid_ for clarity
        $target_file_on_server = $target_dir . $unique_filename;

        // Basic check for allowed video types (can be expanded)
        $allowed_extensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv'];
        if (!in_array($file_extension, $allowed_extensions)) {
            $response['status'] = 1;
            $response['message'] = 'Invalid video file type. Allowed types: ' . implode(', ', $allowed_extensions);
            header('Content-Type: application/json');
            echo json_encode($response);
            mysqli_close($conn);
            exit;
        }


        if (move_uploaded_file($file['tmp_name'], $target_file_on_server)) {
            $db_video_url_final = $path_for_db . $unique_filename;
            $db_video_type_final = 'file'; // Use validated type
        } else {
            $uploadErrors = [ /* ... existing upload errors array ... */ ];
            $errorCode = $file['error'];
            $errorMessage = isset($uploadErrors[$errorCode]) ? $uploadErrors[$errorCode] : 'Unknown error during file move.';
            $response = ['status' => 1, 'message' => 'File upload error: ' . $errorMessage];
            header('Content-Type: application/json');
            echo json_encode($response);
            mysqli_close($conn);
            exit;
        }
    }

    $query = "INSERT INTO course_content (course_id, title, chapter_title, content, video_url, video_type) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $query);

    if ($stmt) {
        // Bind parameters: i for integer, s for string.
        // course_id (i), title (s), chapter_title (s), content (s), video_url (s), video_type (s)
        mysqli_stmt_bind_param($stmt, "isssss",
            $course_id,
            $title_raw,
            $chapter_title_raw,
            $db_content_final,
            $db_video_url_final,
            $db_video_type_final
        );

        if (mysqli_stmt_execute($stmt)) {
            $response['status'] = 0;
            $response['message'] = 'Course content uploaded successfully.';
            $response['content_id'] = mysqli_insert_id($conn);
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error saving to database: ' . mysqli_stmt_error($stmt);
        }
        mysqli_stmt_close($stmt);
    } else {
        $response['status'] = 1;
        $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
    }
} else {
    $error_messages = [];
    if ($course_id === false) $error_messages[] = 'Course ID must be a valid integer.';
    if (empty($title_raw)) $error_messages[] = 'Title is missing.';
    if (empty($chapter_title_raw)) $error_messages[] = 'Chapter Title is missing.';
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
