<?php
require_once '../assets/connection.php';

// --- Initial Setup ---
$course_details = null;
$all_course_contents = [];
$questions_answers = [];
$chapters = [];
$error_message = '';

if (!isset($_GET['course'])) {
    $error_message = "No course specified. Please go back and select a course.";
} else {
    $course_id = intval($_GET['course']);

    // --- Fetch Course Details ---
    $query_details = "SELECT title, certificate_fee FROM courses WHERE id = ?";
    if ($stmt_details = mysqli_prepare($conn, $query_details)) {
        mysqli_stmt_bind_param($stmt_details, "i", $course_id);
        mysqli_stmt_execute($stmt_details);
        $result_details = mysqli_stmt_get_result($stmt_details);
        $course_details = mysqli_fetch_assoc($result_details);
    }

    if (!$course_details) {
        $error_message = "Course not found.";
    } else {
        // --- Fetch Course Contents ---
        $query_contents = "SELECT id, course_id, title, chapter_title, content, video_type, video_url FROM course_contents WHERE course_id = ? ORDER BY id ASC";
        if ($stmt_contents = mysqli_prepare($conn, $query_contents)) {
            mysqli_stmt_bind_param($stmt_contents, "i", $course_id);
            mysqli_stmt_execute($stmt_contents);
            $result_contents = mysqli_stmt_get_result($stmt_contents);
            while ($row = mysqli_fetch_assoc($result_contents)) {
                $all_course_contents[] = $row;
            }
        }

        // --- Process Chapters ---
        $has_chapters = false;
        foreach ($all_course_contents as $content) {
            $trimmed_title = trim($content['chapter_title']);
            if (!empty($trimmed_title)) {
                $has_chapters = true;
                if (!in_array($trimmed_title, $chapters)) {
                    $chapters[] = $trimmed_title;
                }
            }
        }

        if (!$has_chapters && !empty($all_course_contents)) {
            $chapters[] = 'General';
            foreach ($all_course_contents as &$content) {
                $content['chapter_title'] = 'General';
            }
            unset($content);
        }

        // --- Fetch Questions and Answers ---
        $query_qa = "SELECT question, answer FROM questions_answers WHERE course_id = ?";
        if($stmt_qa = mysqli_prepare($conn, $query_qa)){
            mysqli_stmt_bind_param($stmt_qa, "i", $course_id);
            mysqli_stmt_execute($stmt_qa);
            $result_qa = mysqli_stmt_get_result($stmt_qa);
            while($row = mysqli_fetch_assoc($result_qa)){
                $questions_answers[] = $row;
            }
        }
    }
}

// --- Prepare data for JavaScript ---
$js_data_for_client = [
    'course_details' => $course_details,
    'course_contents' => $all_course_contents,
    'questions_answers' => $questions_answers,
    'chapters' => $chapters
];

// Determine initial state for display
$initial_content_item = !empty($all_course_contents) ? $all_course_contents[0] : null;
$initial_chapter_title = !empty($chapters) ? htmlspecialchars($chapters[0]) : 'N/A';
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Course Content</title>
    <link rel="shortcut icon" type="image/png" href="../assets/images/logos/favicon.png" />
    <link rel="stylesheet" href="../assets/css/styles.min.css" />
    <link href="https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/style.css" rel="stylesheet" type="text/css" />
    <script>
        window.PHP_DATA = <?php echo json_encode($js_data_for_client); ?>;
    </script>
    <style>
      .table { position: relative; }
      .custom-loader { position: absolute; width: 50px; height: 50px; border-radius: 50%; border: 8px solid; border-color: #e4e4ed; border-right-color: #766df4; animation: s2 1s infinite linear; inset: 50%; display: none; }
      .showloader { display: block; }
      @keyframes s2 { to { transform: rotate(1turn); } }
      .content-item-completed { background-color: #e6ffed !important; border-left: 4px solid #28a745; }
      .content-item-completed::after { content: ' ✔'; color: green; }
    </style>
  </head>
  <body>
    <div class="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full" data-sidebar-position="fixed" data-header-position="fixed">
      <aside class="left-sidebar">
        <div>
          <div class="brand-logo d-flex align-items-center justify-content-between">
            <h2>SPYDERTECH</h2>
            <div class="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
              <i class="ti ti-x fs-8"></i>
            </div>
          </div>
          <nav class="sidebar-nav scroll-sidebar" data-simplebar="">
            <ul id="sidebarnav">
              <li class="nav-small-cap"><i class="ti ti-dots nav-small-cap-icon fs-4"></i><span class="hide-menu">Home</span></li>
              <li class="sidebar-item"><a class="sidebar-link" href="dashboard.html" aria-expanded="false"><span><i class="ti ti-layout-dashboard"></i></span><span class="hide-menu">Dashboard</span></a></li>
              <li class="sidebar-item"><a class="sidebar-link" href="courses.html" aria-expanded="false"><span><i class="ti ti-book"></i></span><span class="hide-menu">All Courses</span></a></li>
              <li class="sidebar-item"><a class="sidebar-link" href="activecourses.html" aria-expanded="false"><span><i class="ti ti-school"></i></span><span class="hide-menu">Active Courses</span></a></li>
            </ul>
            <div class="unlimited-access hide-menu bg-light-primary position-relative mb-7 mt-5 rounded">
              <div class="d-flex">
                <div class="unlimited-access-title me-3">
                  <h6 class="fw-semibold fs-4 mb-6 text-dark w-85"><a id='logout'>Logout</a></h6>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </aside>
      <div class="body-wrapper">
        <header class="app-header">
          <nav class="navbar navbar-expand-lg navbar-light">
            <ul class="navbar-nav">
              <li class="nav-item d-block d-xl-none"><a class="nav-link sidebartoggler nav-icon-hover" id="headerCollapse" href="javascript:void(0)"><i class="ti ti-menu-2"></i></a></li>
              <li class="nav-item"><a class="nav-link nav-icon-hover" href="javascript:void(0)"><i class="ti ti-bell-ringing"></i><div class="notification bg-primary rounded-circle"></div></a></li>
            </ul>
            <div class="navbar-collapse justify-content-end px-0" id="navbarNav">
              <ul class="navbar-nav flex-row ms-auto align-items-center justify-content-end">
                <li class="nav-item dropdown">
                  <a class="nav-link nav-icon-hover" href="javascript:void(0)" id="drop2" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="../assets/images/profile/user-1.jpg" alt="" width="35" height="35" class="rounded-circle">
                  </a>
                  <div class="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop2">
                    <div class="message-body">
                      <a href="profile.html" class="d-flex align-items-center gap-2 dropdown-item"><i class="ti ti-user fs-6"></i><p class="mb-0 fs-3">My Profile</p></a>
                      <a href="javascript:void(0)" class="d-flex align-items-center gap-2 dropdown-item"><i class="ti ti-mail fs-6"></i><p class="mb-0 fs-3">My Account</p></a>
                      <a href="transactions.html" class="d-flex align-items-center gap-2 dropdown-item"><i class="ti ti-list-check fs-6"></i><p class="mb-0 fs-3">My Transactions</p></a>
                      <a href="../authentication-login.html" class="btn btn-outline-primary mx-3 mt-2 d-block">Logout</a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        <div class="container-fluid">
          <?php if (!empty($error_message)): ?>
            <div class="alert alert-danger"><?php echo $error_message; ?></div>
          <?php else: ?>
            <div class="row">
              <div class="col-lg-8">
                <div class="row">
                    <div class="col-md-4" id="chapter-navigation-panel">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title fw-semibold">Course Chapters</h5>
                                <h6 class="mt-2 mb-1">Current: <span id="current-chapter-display" class="text-primary"><?php echo $initial_chapter_title; ?></span></h6>
                                <ul id="chapter-sidebar-list" class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
                                    <?php if (empty($chapters)): ?>
                                        <li class="list-group-item">No chapters available.</li>
                                    <?php else: ?>
                                        <?php foreach ($chapters as $index => $chapter_title): ?>
                                            <li class="list-group-item list-group-item-action <?php echo ($index == 0) ? 'active' : ''; ?>" style="cursor: pointer;" data-chapter-index="<?php echo $index; ?>">
                                                <?php echo htmlspecialchars($chapter_title); ?>
                                            </li>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </ul>
                                <div class="mt-3 d-flex justify-content-between">
                                    <button id="prev-chapter-btn" class="btn btn-outline-secondary btn-sm" <?php echo (count($chapters) < 2) ? 'disabled' : ''; ?>>Previous</button>
                                    <button id="next-chapter-btn" class="btn btn-outline-secondary btn-sm" <?php echo (count($chapters) < 2) ? 'disabled' : ''; ?>>Next</button>
                                </div>
                                <div id="certificate-section" class="mt-4 pt-3 border-top" style="display: none;">
                                    <h6 class="fw-semibold">Course Completion</h6>
                                    <p id="course-progress-text" class="fs-6 mb-2">Your progress will appear here.</p>
                                    <a href="#" id="get-certificate-btn" class="btn btn-success w-100 disabled" target="_blank">Get Certificate</a>
                                    <small id="certificate-fee-display" class="form-text text-muted d-block text-center mt-1"></small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8" id="main-content-area">
                        <h4 id="title" class="mb-3"><?php echo htmlspecialchars($course_details['title']); ?></h4>
                        <div class="mb-4" id="content-item-display-area">
                             <video src="<?php echo $initial_content_item && !empty($initial_content_item['video_url']) ? htmlspecialchars($initial_content_item['video_url']) : ''; ?>" controls style="width: 100%; display: <?php echo ($initial_content_item && !empty($initial_content_item['video_url'])) ? 'block' : 'none'; ?>; max-height: 500px;"></video>
                             <div id="description" class="mt-3 content-description-box p-3 border rounded" style="min-height: 100px; background-color: #f8f9fa;"><?php echo $initial_content_item ? $initial_content_item['content'] : 'Select an item to view its content.'; ?></div>
                        </div>
                        <h5 id="selected-chapter-content-title" class="mt-4 mb-3">Content for: <?php echo $initial_chapter_title; ?></h5>
                        <div id="chapters-container" class="list-group">
                            <?php
                            if (!empty($chapters)) {
                                $content_in_first_chapter = array_filter($all_course_contents, function($content) use ($initial_chapter_title) {
                                    return $content['chapter_title'] === htmlspecialchars_decode($initial_chapter_title);
                                });
                                if (empty($content_in_first_chapter)) {
                                    echo '<p class="list-group-item">This chapter has no content items yet.</p>';
                                } else {
                                    foreach ($content_in_first_chapter as $content_item) {
                                        $is_active = ($initial_content_item && $initial_content_item['id'] == $content_item['id']) ? 'active' : '';
                                        echo '<a href="#" class="list-group-item list-group-item-action ' . $is_active . '" data-content-id="' . $content_item['id'] . '">' . htmlspecialchars($content_item['title']) . '</a>';
                                    }
                                }
                            } else {
                                echo '<p>This course has no content organized into chapters yet.</p>';
                            }
                            ?>
                        </div>
                    </div>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title fw-semibold mb-4">Questions and Answers</h4>
                    <div id="qa-list-dynamic-parent">
                        <?php if (empty($questions_answers)): ?>
                            <p>No questions have been asked for this course yet.</p>
                        <?php else: ?>
                            <?php foreach ($questions_answers as $qa): ?>
                                <div class="card mb-2">
                                    <div class="card-body p-3">
                                        <h6 class="card-title mb-1"><?php echo htmlspecialchars($qa['question']); ?></h6>
                                        <p class="card-text fs-6"><?php echo htmlspecialchars($qa['answer'] ?: 'Awaiting answer...'); ?></p>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title fw-semibold mb-4">Ask a Question</h5>
                    <div class="question-form">
                      <textarea id="questionTextarea" class="form-control" rows="3" placeholder="Enter your question"></textarea>
                      <button id="submitQuestionBtn" class="btn btn-primary mt-3">Submit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <?php endif; ?>
          <div class="py-6 px-6 text-center">
            <p class="mb-0 fs-4">Powered by Mibble Technologies</p>
          </div>
        </div>
      </div>
    </div>
    <div class="custom-loader"></div>
    <script src="https://code.jquery.com/jquery-3.7.0.slim.js" integrity="sha256-7GO+jepT9gJe9LB4XFf8snVOjX3iYNb0FHYr5LI1N5c=" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src="../assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/sidebarmenu.js"></script>
    <script src="../assets/js/app.min.js"></script>
    <script src="../assets/libs/apexcharts/dist/apexcharts.min.js"></script>
    <script src="../assets/libs/simplebar/dist/simplebar.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@latest" type="text/javascript"></script>
    <script src="../assets/js/loader.js"></script>
    <script src="../assets/js/course-content.js"></script>
    <script src="../assets/js/validate-login.js"></script>
    <script src="../assets/js/logout.js"></script>
  </body>
</html>