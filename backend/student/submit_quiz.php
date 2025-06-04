<?php
require_once '../assets/connection.php';
require_once '../assets/inject.php';

// Initialize variables
$response = array();

// Retrieve the JSON payload
$json = file_get_contents('php://input');

// Decode the JSON payload
$obj = json_decode($json, true);

// Check if decoding was successful and all required fields are present
if ($obj && isset($obj['student_id'], $obj['quiz_id'], $obj['answers'])) {

    // Sanitize student_id and quiz_id
    $student_id = mysql_entities_fix_string($conn, $obj['student_id']);
    $quiz_id = mysql_entities_fix_string($conn, $obj['quiz_id']);

    // Validate answers array and its content
    $answers = $obj['answers'];
    if (!is_array($answers)) {
        $response['status'] = 1;
        $response['message'] = "'answers' must be an array.";
        header('Content-Type: application/json');
        echo json_encode($response);
        mysqli_close($conn);
        exit;
    }

    // Sanitize answers (question_id and selected_option)
    $sanitized_answers = [];
    foreach ($answers as $answer) {
        if (isset($answer['question_id'], $answer['selected_option'])) {
            $sanitized_question_id = mysql_entities_fix_string($conn, $answer['question_id']);
            $sanitized_selected_option = mysql_entities_fix_string($conn, strtolower($answer['selected_option']));

            if (empty($sanitized_question_id) || empty($sanitized_selected_option)) {
                 $response['status'] = 1;
                 $response['message'] = "Each answer must have non-empty 'question_id' and 'selected_option'.";
                 header('Content-Type: application/json');
                 echo json_encode($response);
                 mysqli_close($conn);
                 exit;
            }
            $sanitized_answers[] = [
                'question_id' => $sanitized_question_id,
                'selected_option' => $sanitized_selected_option
            ];
        } else {
            $response['status'] = 1;
            $response['message'] = "Each answer object must contain 'question_id' and 'selected_option'.";
            header('Content-Type: application/json');
            echo json_encode($response);
            mysqli_close($conn);
            exit;
        }
    }

    if (empty($student_id) || empty($quiz_id) || empty($sanitized_answers)) {
        $response['status'] = 1;
        $response['message'] = 'Student ID, Quiz ID, and at least one answer are required and cannot be empty.';
    } else {
        // Fetch correct answers for the given quiz_id
        $query_correct_answers = "SELECT id, correct_option FROM quiz_questions WHERE quiz_id = '$quiz_id'";
        $result_correct_answers = mysqli_query($conn, $query_correct_answers);

        if ($result_correct_answers) {
            $correct_answers_map = [];
            while ($row = mysqli_fetch_assoc($result_correct_answers)) {
                $correct_answers_map[$row['id']] = $row['correct_option'];
            }

            $total_questions_in_quiz = count($correct_answers_map);

            if ($total_questions_in_quiz == 0 && !empty($sanitized_answers)) {
                 // This case implies quiz_id might be valid but has no questions,
                 // or an attempt to submit answers for a non-existent/empty quiz.
                 $response['status'] = 1;
                 $response['message'] = 'No questions found for this quiz ID, or the quiz is empty.';
            } else {
                // Calculate score
                $score = 0;
                foreach ($sanitized_answers as $submitted_answer) {
                    $question_id = $submitted_answer['question_id'];
                    $selected_option = $submitted_answer['selected_option'];

                    if (isset($correct_answers_map[$question_id]) && $correct_answers_map[$question_id] === $selected_option) {
                        $score++;
                    }
                }

                // Store the quiz attempt
                $query_insert_attempt = "INSERT INTO student_quiz_attempts (student_id, quiz_id, score, timestamp)
                                         VALUES ('$student_id', '$quiz_id', $score, CURRENT_TIMESTAMP)";
                $result_insert_attempt = mysqli_query($conn, $query_insert_attempt);

                if ($result_insert_attempt) {
                    $response['status'] = 0;
                    $response['message'] = 'Quiz submitted successfully.';
                    $response['score'] = $score;
                    $response['total_questions'] = $total_questions_in_quiz;
                } else {
                    $response['status'] = 1;
                    $response['message'] = 'Error saving quiz attempt: ' . mysqli_error($conn);
                }
            }
        } else {
            $response['status'] = 1;
            $response['message'] = 'Error fetching quiz details: ' . mysqli_error($conn);
        }
    }
} else {
    $missing_params = [];
    if (!isset($obj['student_id'])) $missing_params[] = 'student_id';
    if (!isset($obj['quiz_id'])) $missing_params[] = 'quiz_id';
    if (!isset($obj['answers'])) $missing_params[] = 'answers';

    if (!$obj) {
         $response['status'] = 1;
         $response['message'] = 'Invalid JSON payload.';
    } else {
         $response['status'] = 1;
         $response['message'] = 'Required parameters are missing: ' . implode(', ', $missing_params);
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

// Close the database connection
mysqli_close($conn);
?>
