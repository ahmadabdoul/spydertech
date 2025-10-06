<?php
session_start();
require_once '../assets/connection.php';

$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');
$obj = json_decode($json, true);

if (!$obj || !isset($obj['courseId']) || !isset($obj['userId'])) {
    $response = array('status' => 1, 'message' => 'Invalid request. Course ID and User ID are required.');
    echo json_encode($response);
    exit();
}

$courseId = $obj['courseId'];
$userId = $obj['userId'];

if (empty($courseId) || empty($userId)) {
    $response = array('status' => 1, 'message' => 'Course ID and User ID cannot be empty.');
    echo json_encode($response);
    exit();
}

// Fetch Course Details (Enrollment Fee and Teacher ID)
$stmt = $conn->prepare("SELECT enrollment_fee, teacher_id FROM courses WHERE id = ?");
$stmt->bind_param("i", $courseId);
$stmt->execute();
$result_course_details = $stmt->get_result();

if ($result_course_details->num_rows == 0) {
    $response = array('status' => 1, 'message' => 'Course not found.');
} else {
    $course_data = $result_course_details->fetch_assoc();
    $enrollment_fee = floatval($course_data['enrollment_fee']);
    $teacher_id = $course_data['teacher_id'];

    // Fetch Student Details (Wallet Balance)
    $stmt = $conn->prepare("SELECT wallet_balance FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result_user_details = $stmt->get_result();

    if ($result_user_details->num_rows == 0) {
        $response = array('status' => 1, 'message' => 'User not found.');
    } else {
        $user_data = $result_user_details->fetch_assoc();
        $wallet_balance = floatval($user_data['wallet_balance']);

        // Check if the user is already enrolled
        $stmt = $conn->prepare("SELECT id FROM student_courses WHERE course_id = ? AND student_id = ?");
        $stmt->bind_param("ii", $courseId, $userId);
        $stmt->execute();
        $result_check_enrollment = $stmt->get_result();

        if ($result_check_enrollment->num_rows > 0) {
            $response = array('status' => 1, 'message' => 'You are already enrolled in this course.');
        } else {
            // Proceed with enrollment
            if ($enrollment_fee > 0) {
                if ($wallet_balance < $enrollment_fee) {
                    $response = array('status' => 1, 'message' => 'Insufficient funds. Please top up your wallet.');
                } else {
                    // Start transaction
                    $conn->autocommit(FALSE);

                    // 1. Deduct fee from student
                    $new_student_balance = $wallet_balance - $enrollment_fee;
                    $stmt1 = $conn->prepare("UPDATE users SET wallet_balance = ? WHERE id = ?");
                    $stmt1->bind_param("di", $new_student_balance, $userId);
                    $success1 = $stmt1->execute();

                    // 2. Enroll student
                    $stmt2 = $conn->prepare("INSERT INTO student_courses (course_id, student_id, completion_status, start_date) VALUES (?, ?, 'In Progress', NOW())");
                    $stmt2->bind_param("ii", $courseId, $userId);
                    $success2 = $stmt2->execute();

                    // 3. Get teacher details
                    $stmt3 = $conn->prepare("SELECT wallet_balance, revenue_percentage FROM teachers WHERE id = ?");
                    $stmt3->bind_param("i", $teacher_id);
                    $stmt3->execute();
                    $teacher_result = $stmt3->get_result();
                    $teacher_data = $teacher_result->fetch_assoc();

                    $teacher_revenue = $enrollment_fee * (floatval($teacher_data['revenue_percentage']) / 100);
                    $new_teacher_balance = floatval($teacher_data['wallet_balance']) + $teacher_revenue;

                    // 4. Update teacher's wallet
                    $stmt4 = $conn->prepare("UPDATE teachers SET wallet_balance = ? WHERE id = ?");
                    $stmt4->bind_param("di", $new_teacher_balance, $teacher_id);
                    $success4 = $stmt4->execute();

                    // 5. Record transaction
                    $stmt5 = $conn->prepare("INSERT INTO transactions (student_id, course_id, teacher_id, amount, teacher_revenue, transaction_type) VALUES (?, ?, ?, ?, ?, 'enrollment')");
                    $stmt5->bind_param("iiidd", $userId, $courseId, $teacher_id, $enrollment_fee, $teacher_revenue);
                    $success5 = $stmt5->execute();

                    if ($success1 && $success2 && $teacher_result->num_rows > 0 && $success4 && $success5) {
                        $conn->commit();
                        $response = array('status' => 0, 'message' => 'Enrollment successful. Fee deducted and teacher revenue shared.');
                    } else {
                        $conn->rollback();
                        $response = array('status' => 1, 'message' => 'Enrollment failed during transaction. Please try again.');
                    }
                    $conn->autocommit(TRUE);
                }
            } else {
                // Free course
                $stmt = $conn->prepare("INSERT INTO student_courses (course_id, student_id, completion_status, start_date) VALUES (?, ?, 'In Progress', NOW())");
                $stmt->bind_param("ii", $courseId, $userId);
                if ($stmt->execute()) {
                    $response = array('status' => 0, 'message' => 'Successfully enrolled in free course.');
                } else {
                    $response = array('status' => 1, 'message' => 'Enrollment failed for free course.');
                }
            }
        }
    }
}

$stmt->close();
header('Content-Type: application/json');
echo json_encode($response);
$conn->close();
?>