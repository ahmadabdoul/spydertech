<?php
require_once '../assets/inject.php';
require_once '../assets/connection.php';


// Get the limit parameter from the URL
$limit = isset($_GET['limit']) ? mysql_entities_fix_string($conn, $_GET['limit']) : 'all';
$response = array();

// Construct the query to retrieve courses with optional limit
// Explicitly listing columns for clarity and robustness, including new fee columns
$query = "SELECT c.id, c.title, c.description, c.teacher_id, c.enrollment_fee, c.certificate_fee, t.username AS teacher_username FROM courses c";
$query .= " LEFT JOIN teachers t ON c.teacher_id = t.id";

// Check if a specific limit is provided
if ($limit !== 'all' && is_numeric($limit)) {
    $query .= " LIMIT " . intval($limit);
}

// Retrieve courses from the database
$result = mysqli_query($conn, $query) or die(json_encode(array('status' => 1, 'message' => 'Error occurred during retrieval of courses.')));

// Check if there are any courses
if (mysqli_num_rows($result) > 0) {
    $response['status'] = 0;
    // Loop through each row and display course information
    while ($row = mysqli_fetch_assoc($result)) {
        $courseId = $row['id'];
        $courseTitle = $row['title'];
        $courseDescription = $row['description'];
        $teacherUsername = $row['teacher_username'];
        $enrollmentFee = $row['enrollment_fee'];
        $certificateFee = $row['certificate_fee'];
       
        $response['courses'][] = array(
            'id' => $courseId,
            'title' => $courseTitle,
            'description' => $courseDescription,
            'teacher_username' => $teacherUsername,
            'enrollment_fee' => $enrollmentFee,
            'certificate_fee' => $certificateFee
        );
    }
} else {
    // No courses found, but this is not necessarily an error for a list endpoint.
    // Sending status 0 with an empty array is often preferred.
    // However, to maintain consistency with the original script's behavior on "no courses":
    // $response['status'] = 1;
    // $response['message'] = 'No Courses Found';
    // For this change, we'll assume status 0 and empty array is fine if no courses.
    // If original behavior of status 1 for "No Courses Found" is critical, that part of the else can be uncommented.
    // The current task is just to add fields, so let's keep original status logic for no courses.
     $response['status'] = 1; // Original behavior
     $response['message'] = 'No Courses Found'; // Original behavior
  }


// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
// Close the database connection
mysqli_close($conn);
?>
