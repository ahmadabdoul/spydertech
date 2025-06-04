<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$response = array();

// Check if course_id is provided in GET parameters
if (isset($_GET['course_id'])) {
    // Sanitize course_id
    $course_id = mysql_entities_fix_string($conn, $_GET['course_id']);

    // Validate that sanitized course_id is not empty
    if (!empty($course_id)) {
        // Construct the SQL query to retrieve quizzes for the given course_id
        $query = "SELECT id AS quiz_id, title
                  FROM quizzes
                  WHERE course_id = '$course_id'
                  ORDER BY title ASC"; // Order by title for user-friendly display

        $result = mysqli_query($conn, $query);

        if ($result) {
            $quizzes = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $quizzes[] = $row;
            }
            $response['status'] = 0;
            $response['quizzes'] = $quizzes; // Will be an empty array if no quizzes are found
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error fetching quizzes: ' . mysqli_error($conn);
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Course ID cannot be empty.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Course ID not provided.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
