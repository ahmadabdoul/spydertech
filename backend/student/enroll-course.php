<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';
// Initialize variables
$response = array();
$courseId = null;
$userId = null;
$enrollment_fee = 0.00;
$wallet_balance = 0.00;

// Retrieve the JSON payload
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

if (!$obj || !isset($obj['courseId']) || !isset($obj['userId'])) {
    $response = array('status' => 1, 'message' => 'Invalid request. Course ID and User ID are required.');
} else {
    $courseId = mysql_entities_fix_string($conn, $obj['courseId']);
    $userId = mysql_entities_fix_string($conn, $obj['userId']);

    if (empty($courseId) || empty($userId)) {
        $response = array('status' => 1, 'message' => 'Course ID and User ID cannot be empty.');
    } else {
        // Fetch Course Details (Enrollment Fee)
        $query_course_details = "SELECT enrollment_fee FROM courses WHERE id = '$courseId'";
        $result_course_details = mysqli_query($conn, $query_course_details);

        if (!$result_course_details || mysqli_num_rows($result_course_details) == 0) {
            $response = array('status' => 1, 'message' => 'Course not found.');
        } else {
            $course_data = mysqli_fetch_assoc($result_course_details);
            $enrollment_fee = floatval($course_data['enrollment_fee']);

            // Fetch Student Details (Wallet Balance)
            $query_user_details = "SELECT wallet_balance FROM users WHERE id = '$userId'";
            $result_user_details = mysqli_query($conn, $query_user_details);

            if (!$result_user_details || mysqli_num_rows($result_user_details) == 0) {
                $response = array('status' => 1, 'message' => 'User not found.');
            } else {
                $user_data = mysqli_fetch_assoc($result_user_details);
                $wallet_balance = floatval($user_data['wallet_balance']);

                // Check if the user is already enrolled in the course
                $query_check_enrollment = "SELECT * FROM student_courses WHERE course_id = '$courseId' AND student_id = '$userId'";
                $result_check_enrollment = mysqli_query($conn, $query_check_enrollment);

                if ($result_check_enrollment && mysqli_num_rows($result_check_enrollment) > 0) {
                    $response = array('status' => 1, 'message' => 'You are already enrolled in this course.');
                } else if (!$result_check_enrollment) {
                     $response = array('status' => 1, 'message' => 'Error checking enrollment status: ' . mysqli_error($conn));
                } else {
                    // User is not enrolled, proceed with enrollment logic
                    if ($enrollment_fee > 0) {
                        if ($wallet_balance < $enrollment_fee) {
                            $response = array('status' => 1, 'message' => 'Insufficient funds to enroll in this course. Please top up your wallet.');
                        } else {
                            // Sufficient funds, proceed with transaction
                            mysqli_autocommit($conn, FALSE);
                            $new_balance = $wallet_balance - $enrollment_fee;

                            $update_wallet_query = "UPDATE users SET wallet_balance = $new_balance WHERE id = '$userId'";
                            $update_wallet_result = mysqli_query($conn, $update_wallet_query);

                            $enroll_query = "INSERT INTO student_courses (course_id, student_id, completion_status, start_date) VALUES ('$courseId', '$userId', 'In Progress', NOW())";
                            $enroll_result = mysqli_query($conn, $enroll_query);

                            if ($update_wallet_result && mysqli_affected_rows($conn) == 1 && $enroll_result) {
                                mysqli_commit($conn);
                                $response = array('status' => 0, 'message' => 'Course enrollment successful. Fee deducted from wallet.');
                            } else {
                                mysqli_rollback($conn);
                                $response = array('status' => 1, 'message' => 'Course enrollment failed during transaction. Please try again. DB Error: '.mysqli_error($conn));
                            }
                            mysqli_autocommit($conn, TRUE);
                        }
                    } else {
                        // Free course, enroll directly
                        $enroll_query = "INSERT INTO student_courses (course_id, student_id, completion_status, start_date) VALUES ('$courseId', '$userId', 'In Progress', NOW())";
                        $enroll_result = mysqli_query($conn, $enroll_query);

                        if ($enroll_result) {
                            $response = array('status' => 0, 'message' => 'Course enrollment successful.');
                        } else {
                            $response = array('status' => 1, 'message' => 'Course enrollment failed: ' . mysqli_error($conn));
                        }
                    }
                }
            }
        }
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
