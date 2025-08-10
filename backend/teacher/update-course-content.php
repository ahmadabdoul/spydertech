<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Initialize variables
$response = array();

// --- Input Extraction and Validation ---
$content_id = isset($_POST['id']) ? filter_var($_POST['id'], FILTER_VALIDATE_INT) : null;
$title_raw = trim(isset($_POST['title']) ? $_POST['title'] : '');
$chapter_title_raw = trim(isset($_POST['chapter_title']) ? $_POST['chapter_title'] : '');
$content_raw = trim(isset($_POST['content']) ? $_POST['content'] : '');
$video_type_input = trim(isset($_POST['video_type']) ? $_POST['video_type'] : '');
$url_input = trim(isset($_POST['url']) ? $_POST['url'] : '');

$is_core_data_present = $content_id !== false && !empty($title_raw) && !empty($chapter_title_raw);
$is_text_content_present = !empty($content_raw);
$is_video_url_provided = ($video_type_input === 'url' && !empty($url_input));
$is_video_file_provided = ($video_type_input === 'file' && isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK);

if ($is_core_data_present && ($is_text_content_present || $is_video_url_provided || $is_video_file_provided)) {

    $db_content_final = !empty($content_raw) ? $content_raw : NULL;
    $db_video_url_final = NULL;
    $db_video_type_final = '';

    if ($is_video_url_provided) {
        $db_video_url_final = $url_input;
        $db_video_type_final = 'url';
    } elseif ($is_video_file_provided) {
        $file = $_FILES['video'];
        $target_dir = '../uploads/';
        $path_for_db = 'uploads/';

        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $unique_filename = uniqid('vid_', true) . '.' . $file_extension;
        $target_file_on_server = $target_dir . $unique_filename;

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
            $db_video_type_final = 'file';
        } else {
            $response = ['status' => 1, 'message' => 'File upload error.'];
            header('Content-Type: application/json');
            echo json_encode($response);
            mysqli_close($conn);
            exit;
        }
    }

    $query = "UPDATE course_content SET title = ?, chapter_title = ?, content = ?, video_url = ?, video_type = ? WHERE id = ?";
    $stmt = mysqli_prepare($conn, $query);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "sssssi",
            $title_raw,
            $chapter_title_raw,
            $db_content_final,
            $db_video_url_final,
            $db_video_type_final,
            $content_id
        );

        if (mysqli_stmt_execute($stmt)) {
            $response['status'] = 0;
            $response['message'] = 'Course content updated successfully.';
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error updating database: ' . mysqli_stmt_error($stmt);
        }
        mysqli_stmt_close($stmt);
    } else {
        $response['status'] = 1;
        $response['message'] = 'Database statement preparation error: ' . mysqli_error($conn);
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Required fields are missing or invalid.';
}

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($conn);
?>
