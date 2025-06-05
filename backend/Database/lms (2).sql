-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2023 at 07:07 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `teacher_id` int(11) NOT NULL,
  `enrollment_fee` DECIMAL(10, 2) DEFAULT '0.00',
  `certificate_fee` DECIMAL(10, 2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `teacher_id`, `enrollment_fee`, `certificate_fee`) VALUES
(1, 'Introduction to Programming', 'Learn the basics of programming', 1, '0.00', '0.00'),
(2, 'Web Development 101', 'Build interactive websites', 2, '0.00', '0.00'),
(3, 'Data Science Fundamentals', 'Explore data analysis and visualization', 3, '0.00', '0.00'),
(4, 'Civil Engineering Materials', 'Civil engineering is a professional engineering discipline that deals with the design, construction, and maintenance of the physical and naturally built environment, including public works such as roads, bridges, canals, dams, airports, sewage systems, pipelines, structural components of buildings, and railways.', 4, '0.00', '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `course_content`
--

CREATE TABLE `course_content` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `chapter_title` VARCHAR(255),
  `content` text DEFAULT NULL,
  `video_type` varchar(50) NOT NULL,
  `video_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_content`
--

INSERT INTO `course_content` (`id`, `course_id`, `title`, `chapter_title`, `content`, `video_type`, `video_url`) VALUES
(1, 1, 'Getting Started with Programming', NULL, 'Introduction to programming concepts', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(2, 1, 'Variables and Data Types', NULL, 'Learn about variables and data types in programming', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(3, 2, 'HTML and CSS Basics', NULL, 'Building blocks of web development', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(4, 2, 'JavaScript Fundamentals', NULL, 'Introduction to JavaScript programming', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(5, 3, 'Data Analysis Techniques', NULL, 'Explore various data analysis methods', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(6, 4, 'Introduction', NULL, 'Civil engineering is a professional engineering discipline that deals with the design, construction, and maintenance of the physical and naturally built environment, including public works such as roads, bridges, canals, dams, airports, sewage systems, pipelines, structural components of buildings, and railways.', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(7, 4, 'Cement', NULL, 'lorem ipsum', 'video', 'uploads/Begin_Again_2014_(2014)_BluRay_high_(fzmovies.net)_e9f83f64bc270027c86f6c3983fde30b.mp4');

-- --------------------------------------------------------

--
-- Table structure for table `course_qa`
--

CREATE TABLE `course_qa` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_qa`
--

INSERT INTO `course_qa` (`id`, `course_id`, `student_id`, `question`, `answer`, `timestamp`) VALUES
(1, 2, 0, 'the video is not playiong', NULL, '2023-06-18 09:52:39'),
(2, 2, 0, 'how to get css color codes', NULL, '2023-06-18 09:55:24'),
(3, 2, 0, 'the page is not working', NULL, '2023-06-18 09:58:21'),
(4, 2, 0, 'when is the new chapter coming?', NULL, '2023-06-18 10:00:21'),
(5, 2, 4, 'last question', 'whats the question?', '2023-06-18 10:02:45'),
(6, 2, 4, 'lastest question', NULL, '2023-06-18 10:16:01'),
(7, 2, 4, 'swal test', 'the swal is working', '2023-06-18 10:19:49'),
(8, 4, 4, 'between gypsum and non gypsum cement which one is better?', 'gypsum is better because bla bla bla', '2023-06-21 17:27:03'),
(9, 4, 4, 'a  quesruikn', NULL, '2023-06-21 18:17:24');

-- --------------------------------------------------------

--
-- Table structure for table `student_courses`
--

CREATE TABLE `student_courses` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `completion_status` varchar(20) NOT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_courses`
--

INSERT INTO `student_courses` (`id`, `student_id`, `course_id`, `completion_status`, `start_date`, `end_date`) VALUES
(1, 1, 1, 'Completed', NULL, NULL),
(2, 1, 2, 'In Progress', NULL, NULL),
(3, 2, 1, 'Not Started', NULL, NULL),
(4, 2, 2, 'Completed', '2023-06-21 15:55:05', '2023-06-21 15:55:05'),
(5, 3, 3, 'In Progress', '2023-06-21 15:55:05', '2023-06-21 15:55:05'),
(6, 4, 1, 'Completed', '2023-06-21 15:55:05', '2023-06-21 15:55:05'),
(7, 4, 2, 'Completed', '2023-06-21 15:55:05', '2023-06-21 15:55:05'),
(10, 4, 4, 'Completed', '2023-06-21 19:17:52', '2023-06-21 19:18:50');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(100) NOT NULL,
  `cellphone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `name`, `username`, `password`, `email`, `cellphone`, `avatar`) VALUES
(1, '', 'John Doe', '', 'john.doe@example.com', NULL, NULL),
(2, '', 'Jane Smith', '', 'jane.smith@example.com', NULL, NULL),
(3, '', 'Michael Johnson', '', 'michael.johnson@example.com', NULL, NULL),
(4, 'Ahmad Abdul', 'ahmadabdoul', '$2y$10$xeRqwXP3zXgnAGY9lMQTsec7UxGdoOg83hCqiY0Z7VoTU7kYvORey', 'a@b.com', '08132154218', 'uploads/image_processing20211229-24089-6b1fsw.png');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(100) NOT NULL,
  `cellphone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `wallet_balance` DECIMAL(10, 2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `cellphone`, `avatar`, `wallet_balance`) VALUES
(1, 'Alice', 'Alice', '$2y$10$WdO9GgEh3d/WUIktItLDDuIaQ6MbXsK.7RHZmYvkg.RQwzES9.A4G', 'alice@example.com', '1234567890', 'avatar1.jpg', '0.00'),
(2, 'Ahmad Abdul', 'ahmadabdoul', '$2y$10$DXCp.6iL/V7TLHUN4QofQ.Oo1pxzlhUE8.fFn9FqIxVKNqKZRjX2K', 'a@b.com', '08132154218', 'uploads/landing-car-removebg-preview.png', '0.00'),
(3, 'Eve', 'Eve', '$2y$10$hVSLZZbzrdUOjrxROvppQ.BB7dAhQU2WNLG2vQVlMly6ElPI.0R7K', 'eve@example.com', '5555555555', 'avatar3.jpg', '0.00'),
(4, 'Sani Yakubu', 'speedy', '$2y$10$TQVnRudeZJzpn8GmfRIpAOdFEzNmdl3NukBzsk0AT3ucARivAaRk6', 'f@mail.com', '123', 'uploads/landing-car-removebg-preview.png', '0.00'),
(5, 'Ahmad Abdul', 'ahmadabdoul', '$2y$10$EKr3UJssJv7ndCX.4KIoe.nJ9fj1fTfhRtCYeMVdLh5OngUZtXeXK', 'a@b.com', '08132154218', NULL, '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) DEFAULT NULL,
  `option_d` varchar(255) DEFAULT NULL,
  `correct_option` char(1) NOT NULL COMMENT 'Stores ''a'', ''b'', ''c'', or ''d''',
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_quiz_attempts`
--

CREATE TABLE `student_quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `student_quiz_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_content_progress`
--

CREATE TABLE `student_content_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `completed_status` tinyint(1) NOT NULL DEFAULT 0, -- 0 for false, 1 for true
  `last_position` varchar(50) DEFAULT NULL, -- To store time like '1:23' or percentage '85%' or scroll position
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_course_content` (`student_id`,`course_id`,`content_id`), -- Ensures one record per student per content item
  KEY `student_id_idx` (`student_id`), -- Added specific index name
  KEY `course_id_idx` (`course_id`), -- Added specific index name
  KEY `content_id_idx` (`content_id`), -- Added specific index name
  CONSTRAINT `fk_progress_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_progress_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_progress_content` FOREIGN KEY (`content_id`) REFERENCES `course_content` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `course_content`
--
ALTER TABLE `course_content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_qa`
--
ALTER TABLE `course_qa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_courses`
--
ALTER TABLE `student_courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `course_content`
--
ALTER TABLE `course_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `course_qa`
--
ALTER TABLE `course_qa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `student_courses`
--
ALTER TABLE `student_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `student_quiz_attempts`
--
ALTER TABLE `student_quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `student_content_progress`
--
ALTER TABLE `student_content_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course_content`
--
ALTER TABLE `course_content`
  ADD CONSTRAINT `course_content_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course_qa`
--
ALTER TABLE `course_qa`
  ADD CONSTRAINT `course_qa_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_qa_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_courses`
--
ALTER TABLE `student_courses`
  ADD CONSTRAINT `student_courses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
