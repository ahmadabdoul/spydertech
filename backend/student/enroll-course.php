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
        // Fetch Course Details (Enrollment Fee and Teacher ID)
        $query_course_details = "SELECT enrollment_fee, teacher_id FROM courses WHERE id = '$courseId'";
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
                            mysqli_autocommit($conn, FALSE); // Start transaction

                            $all_queries_success = true;

                            // 1. Deduct fee from student's wallet
                            $new_student_balance = $wallet_balance - $enrollment_fee;
                            $update_student_wallet_query = "UPDATE users SET wallet_balance = $new_student_balance WHERE id = '$userId'";
                            if (!mysqli_query($conn, $update_student_wallet_query) || mysqli_affected_rows($conn) == 0) {
                                $all_queries_success = false;
                            }

                            // 2. Enroll student in the course
                            if ($all_queries_success) {
                                $enroll_query = "INSERT INTO student_courses (course_id, student_id, completion_status, start_date) VALUES ('$courseId', '$userId', 'In Progress', NOW())";
                                if (!mysqli_query($conn, $enroll_query)) {
                                    $all_queries_success = false;
                                }
                            }

                            // 3. Calculate and distribute teacher's revenue
                            if ($all_queries_success) {
                                $teacher_id = $course_data['teacher_id'];
                                $query_teacher_details = "SELECT wallet_balance, revenue_percentage FROM teachers WHERE id = '$teacher_id'";
                                $result_teacher_details = mysqli_query($conn, $query_teacher_details);

                                if ($result_teacher_details && mysqli_num_rows($result_teacher_details) > 0) {
                                    $teacher_data = mysqli_fetch_assoc($result_teacher_details);
                                    $teacher_revenue_percentage = floatval($teacher_data['revenue_percentage']);
                                    $teacher_current_wallet = floatval($teacher_data['wallet_balance']);
                                    $teacher_revenue = $enrollment_fee * ($teacher_revenue_percentage / 100);
                                    $new_teacher_balance = $teacher_current_wallet + $teacher_revenue;

                                    // Update teacher's wallet
                                    $update_teacher_wallet_query = "UPDATE teachers SET wallet_balance = $new_teacher_balance WHERE id = '$teacher_id'";
                                    if (!mysqli_query($conn, $update_teacher_wallet_query) || mysqli_affected_rows($conn) == 0) {
                                        $all_queries_success = false;
                                    }

                                    // 4. Record the transaction
                                    if ($all_queries_success) {
                                        $transaction_query = "INSERT INTO transactions (student_id, course_id, teacher_id, amount, teacher_revenue, transaction_type) VALUES ('$userId', '$courseId', '$teacher_id', '$enrollment_fee', '$teacher_revenue', 'enrollment')";
                                        if (!mysqli_query($conn, $transaction_query)) {
                                            $all_queries_success = false;
                                        }
                                    }
                                } else {
                                    $all_queries_success = false; // Teacher not found
                                }
                            }

                            // 5. Commit or rollback the transaction
                            if ($all_queries_success) {
                                mysqli_commit($conn);
                                $response = array('status' => 0, 'message' => 'Course enrollment successful. Fee deducted and teacher revenue shared.');
                            } else {
                                mysqli_rollback($conn);
                                $response = array('status' => 1, 'message' => 'Course enrollment failed during transaction. Please try again. DB Error: ' . mysqli_error($conn));
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