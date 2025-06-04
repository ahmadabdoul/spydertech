<?php
session_start(); // Start session for potential use, though using GET for student_id for now

require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Helper function for JSON error output
function output_json_error($message, $connection_variable) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 1, 'message' => $message]);
    if ($connection_variable) {
        mysqli_close($connection_variable);
    }
    exit;
}

// --- 1. Input Retrieval & Validation ---
if (!isset($_GET['course_id']) || !isset($_GET['student_id'])) {
    // In a real scenario, student_id would likely come from $_SESSION['user_id'] or similar
    // For this subtask, we allow it from GET for easier testing.
    output_json_error('Course ID and Student ID are required.', $conn);
}

$course_id_raw = $_GET['course_id'];
$student_id_raw = $_GET['student_id'];
// Example if using session:
// $student_id_raw = isset($_SESSION['user']['id']) ? $_SESSION['user']['id'] : (isset($_GET['student_id']) ? $_GET['student_id'] : null);


$course_id = mysql_entities_fix_string($conn, $course_id_raw);
$student_id = mysql_entities_fix_string($conn, $student_id_raw);

if (empty($course_id) || empty($student_id)) {
    output_json_error('Sanitized Course ID and Student ID cannot be empty.', $conn);
}

// --- 2. Fetch Student Details ---
$query_student = "SELECT name AS student_name, wallet_balance FROM users WHERE id = '$student_id'";
$result_student = mysqli_query($conn, $query_student);
if (!$result_student || mysqli_num_rows($result_student) == 0) {
    output_json_error('Student not found.', $conn);
}
$student_data = mysqli_fetch_assoc($result_student);
$student_name = $student_data['student_name'];
$wallet_balance = floatval($student_data['wallet_balance']);

// --- 3. Fetch Course Details ---
$query_course = "SELECT title AS course_title, certificate_fee FROM courses WHERE id = '$course_id'";
$result_course = mysqli_query($conn, $query_course);
if (!$result_course || mysqli_num_rows($result_course) == 0) {
    output_json_error('Course not found.', $conn);
}
$course_data = mysqli_fetch_assoc($result_course);
$course_title = $course_data['course_title'];
$certificate_fee = floatval($course_data['certificate_fee']);

// --- 4. Check Course Completion ---
$query_completion = "SELECT completion_status, end_date FROM student_courses WHERE student_id = '$student_id' AND course_id = '$course_id'";
$result_completion = mysqli_query($conn, $query_completion);
if (!$result_completion || mysqli_num_rows($result_completion) == 0) {
    output_json_error('Course enrollment record not found for this student.', $conn);
}
$completion_data = mysqli_fetch_assoc($result_completion);

if ($completion_data['completion_status'] !== 'Completed') {
    output_json_error('Course not yet completed.', $conn);
}
$completion_date_raw = $completion_data['end_date'];
$completion_date_formatted = date("F j, Y", strtotime($completion_date_raw));


// --- 5. Handle Certificate Fee ---
$fee_paid_or_not_required = false;
if ($certificate_fee > 0) {
    if ($wallet_balance < $certificate_fee) {
        output_json_error('Insufficient funds in wallet to pay for the certificate. Please top up.', $conn);
    } else {
        // Attempt to deduct fee
        mysqli_autocommit($conn, FALSE); // Start transaction

        $new_balance = $wallet_balance - $certificate_fee;
        // Ensure $new_balance is properly formatted for SQL if necessary, though direct use is fine here.
        $query_update_wallet = "UPDATE users SET wallet_balance = $new_balance WHERE id = '$student_id'";
        $result_update_wallet = mysqli_query($conn, $query_update_wallet);

        if ($result_update_wallet && mysqli_affected_rows($conn) == 1) {
            if (mysqli_commit($conn)) {
                $fee_paid_or_not_required = true;
            } else {
                mysqli_rollback($conn); // Rollback on commit failure
                output_json_error('Failed to finalize fee payment transaction. Please try again.', $conn);
            }
        } else {
            mysqli_rollback($conn); // Rollback on update failure
            output_json_error('Failed to update wallet balance for certificate fee. Error: ' . mysqli_error($conn), $conn);
        }
        mysqli_autocommit($conn, TRUE); // Reset autocommit
    }
} else {
    $fee_paid_or_not_required = true; // No fee required
}

// --- 6. Generate HTML Certificate ---
if ($fee_paid_or_not_required) {
    header('Content-Type: text/html');
    // mysqli_close($conn); // Close connection before outputting HTML

    echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion - {$course_title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .certificate-container { width: 800px; padding: 40px; background-color: #fff; border: 10px solid #ddd; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
        .certificate-container::before, .certificate-container::after {
            content: ''; position: absolute; left: -15px; top: -15px; right: -15px; bottom: -15px;
            border: 5px solid #aa8c3f; z-index: -1;
        }
         .certificate-container::after {
            left: -10px; top: -10px; right: -10px; bottom: -10px;
            border-color: #d4af37;
        }
        h1 { font-size: 36px; color: #333; margin-bottom: 20px; }
        h2 { font-size: 28px; color: #555; margin-bottom: 20px; }
        p { font-size: 18px; color: #666; line-height: 1.6; margin-bottom: 15px; }
        .student-name { font-size: 24px; font-weight: bold; color: #aa8c3f; margin: 20px 0; }
        .course-title { font-size: 22px; font-style: italic; color: #333; margin: 20px 0; }
        .completion-date { font-size: 16px; color: #555; margin-top: 30px; }
        .logo { margin-bottom: 20px; }
        .logo img { max-width: 150px; }
        .signature-area { margin-top: 50px; }
        .signature-line { width: 250px; border-bottom: 1px solid #333; margin: 0 auto 5px auto; }
        .signature-title { font-size: 14px; color: #555; }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="logo">
            <!-- You can add a logo image here if you have one -->
            <!-- <img src="path/to/your/logo.png" alt="LMS Logo"> -->
            <h2>LMS Platform</h2>
        </div>
        <h1>Certificate of Completion</h1>
        <p>This certifies that</p>
        <p class="student-name">{$student_name}</p>
        <p>has successfully completed the course</p>
        <p class="course-title">{$course_title}</p>
        <p>on</p>
        <p class="completion-date">{$completion_date_formatted}</p>

        <div class="signature-area">
            <div class="signature-line"></div>
            <p class="signature-title">Authorized Signature</p>
        </div>
    </div>
</body>
</html>
HTML;
    mysqli_close($conn); // Close connection after outputting HTML
    exit;
} else {
    // This case should ideally not be reached if logic is correct,
    // as fee payment failure already calls output_json_error
    output_json_error('An unexpected error occurred before certificate generation.', $conn);
}

?>
