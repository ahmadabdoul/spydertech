<?php
// Set content type to JSON
header('Content-Type: application/json');

// Include dependencies
// Assuming 'backend' and 'assets' are sibling folders at the project root
require_once '../assets/connection.php';
// inject.php might not be strictly needed if no string sanitization is occurring,
// but including for consistency if it contains other essential functions or settings.
require_once '../assets/inject.php';

// Initialize variables
$response = array();
$courses_array = array();
$limit = 4; // Number of featured courses to fetch

// Construct the SQL query
// Fetches id (as course_id), title, and description
// Orders by id DESC to get newer courses first (assuming higher ID means newer)
$query = "SELECT id AS course_id, title, description
          FROM courses
          ORDER BY id DESC
          LIMIT " . intval($limit); // Ensure limit is an integer

// Execute the query
$result = mysqli_query($conn, $query);

if ($result) {
    // Fetch all results into an array
    while ($row = mysqli_fetch_assoc($result)) {
        // Sanitize output if necessary, though these are coming from DB.
        // For display purposes, usually direct output is fine unless XSS is a concern
        // where this data is rendered directly into HTML without further client-side templating/escaping.
        // Example (if inject.php has a html_safe function or similar):
        // $row['title'] = html_safe($row['title']);
        // $row['description'] = html_safe($row['description']);
        $courses_array[] = $row;
    }
    $response['status'] = 0;
    $response['courses'] = $courses_array; // Will be an empty array if no courses
} else {
    // Database query failure
    $response['status'] = 1;
    $response['message'] = 'Error fetching featured courses: ' . mysqli_error($conn);
}

// Return JSON response
echo json_encode($response);

// Close the database connection
if ($conn) {
    mysqli_close($conn);
}
?>
