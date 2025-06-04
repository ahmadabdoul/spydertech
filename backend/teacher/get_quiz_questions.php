<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$response = array();

// Check if quiz_id is provided in GET parameters
if (isset($_GET['quiz_id'])) {
    // Sanitize quiz_id
    $quiz_id = mysql_entities_fix_string($conn, $_GET['quiz_id']);

    // Validate that sanitized quiz_id is not empty
    if (!empty($quiz_id)) {
        // Construct the SQL query to retrieve all questions for the given quiz_id
        $query = "SELECT id AS question_id, question_text, option_a, option_b, option_c, option_d, correct_option
                  FROM quiz_questions
                  WHERE quiz_id = '$quiz_id'
                  ORDER BY id ASC"; // Order by question ID

        $result = mysqli_query($conn, $query);

        if ($result) {
            $questions = array();
            while ($row = mysqli_fetch_assoc($result)) {
                // Ensure option_c and option_d are handled if they can be NULL in DB
                // and client expects a string (e.g., empty string if NULL for consistency)
                // However, for teacher review, retaining NULL might be more informative.
                // For this script, let's assume client can handle NULL or we send as is from DB.
                $questions[] = $row;
            }
            $response['status'] = 0;
            $response['questions'] = $questions; // Will be an empty array if no questions are found
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error fetching quiz questions: ' . mysqli_error($conn);
        }
    } else {
        $response['status'] = 1;
        $response['message'] = 'Quiz ID cannot be empty.';
    }
} else {
    $response['status'] = 1;
    $response['message'] = 'Quiz ID not provided.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
