<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';

// Assuming you have established a database connection

// Check if the student ID is provided
if (isset($_GET['id'])) {
    // Get and sanitize the student ID
    $studentId_raw = $_GET['id'];
    $studentId = mysql_entities_fix_string($conn, $studentId_raw);

    if (empty($studentId)) {
        $response['status'] = 1;
        $response['message'] = 'Student ID cannot be empty after sanitization.';
    } else {
        // Prepare the query to retrieve student courses, completion status, and fees
        $query = "SELECT sc.course_id, sc.completion_status, c.title AS course_title, c.enrollment_fee, c.certificate_fee";
        $query .= " FROM student_courses sc";
        $query .= " INNER JOIN courses c ON sc.course_id = c.id";
        $query .= " WHERE sc.student_id = '$studentId'"; // Use sanitized $studentId and quotes

        // Execute the query
        $result = mysqli_query($conn, $query);

        if ($result) {
            // Check if there are any student courses
            if (mysqli_num_rows($result) > 0) {
                $response = array(); // Initialize response array here if results are found
                $response['status'] = 0;
                $response['student_id'] = $studentId; // Use the sanitized studentId
                $response['courses'] = array();

                // Loop through each row and fetch the course information
                while ($row = mysqli_fetch_assoc($result)) {
                    $courseId = $row['course_id'];
                    $completionStatus = $row['completion_status'];
                    $courseTitle = $row['course_title'];
                    $enrollmentFee = $row['enrollment_fee'];
                    $certificateFee = $row['certificate_fee'];

                    $response['courses'][] = array(
                        'course_id' => $courseId,
                        'completion_status' => $completionStatus,
                        'course_title' => $courseTitle,
                        'enrollment_fee' => $enrollmentFee,
                        'certificate_fee' => $certificateFee
                    );
                }
            } else {
                // No courses found for the student
                $response['status'] = 0; // Still a success, just no data
                $response['student_id'] = $studentId;
                $response['courses'] = array();
                $response['message'] = 'No Courses Found for the Student'; // Optional message
            }
        } else {
            // Error during query execution
            $response['status'] = 1;
            $response['message'] = 'Error occurred during retrieval of student courses: ' . mysqli_error($conn);
        }
    }
} else {
    // Student ID not provided
    $response['status'] = 1;
    $response['message'] = 'Student ID is missing';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
