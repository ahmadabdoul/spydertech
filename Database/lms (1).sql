-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 14, 2023 at 05:50 PM
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
  `teacher_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `teacher_id`) VALUES
(1, 'Introduction to Programming', 'Learn the basics of programming', 1),
(2, 'Web Development 101', 'Build interactive websites', 2),
(3, 'Data Science Fundamentals', 'Explore data analysis and visualization', 3);

-- --------------------------------------------------------

--
-- Table structure for table `course_content`
--

CREATE TABLE `course_content` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_content`
--

INSERT INTO `course_content` (`id`, `course_id`, `title`, `content`, `video_url`) VALUES
(1, 1, 'Getting Started with Programming', 'Introduction to programming concepts', 'video1.mp4'),
(2, 1, 'Variables and Data Types', 'Learn about variables and data types in programming', 'video2.mp4'),
(3, 2, 'HTML and CSS Basics', 'Building blocks of web development', 'video3.mp4'),
(4, 2, 'JavaScript Fundamentals', 'Introduction to JavaScript programming', 'video4.mp4'),
(5, 3, 'Data Analysis Techniques', 'Explore various data analysis methods', 'video5.mp4');

-- --------------------------------------------------------

--
-- Table structure for table `student_courses`
--

CREATE TABLE `student_courses` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `completion_status` varchar(20) NOT NULL,
  `question` text DEFAULT NULL,
  `reply` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_courses`
--

INSERT INTO `student_courses` (`id`, `student_id`, `course_id`, `completion_status`, `question`, `reply`) VALUES
(1, 1, 1, 'Completed', NULL, NULL),
(2, 1, 2, 'In Progress', 'Question 1', NULL),
(3, 2, 1, 'Not Started', NULL, NULL),
(4, 2, 2, 'Completed', NULL, 'Reply to question 2'),
(5, 3, 3, 'In Progress', 'Question 2', NULL),
(6, 4, 1, 'Completed', NULL, NULL),
(7, 4, 2, 'In Progress', 'Question 1', NULL);

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
(3, '', 'Michael Johnson', '', 'michael.johnson@example.com', NULL, NULL);

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
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `cellphone`, `avatar`) VALUES
(1, '', 'Alice', '$2y$10$WdO9GgEh3d/WUIktItLDDuIaQ6MbXsK.7RHZmYvkg.RQwzES9.A4G', 'alice@example.com', '1234567890', 'avatar1.jpg'),
(2, '', 'Bob', '$2y$10$DXCp.6iL/V7TLHUN4QofQ.Oo1pxzlhUE8.fFn9FqIxVKNqKZRjX2K', 'bob@example.com', '9876543210', 'avatar2.jpg'),
(3, '', 'Eve', '$2y$10$hVSLZZbzrdUOjrxROvppQ.BB7dAhQU2WNLG2vQVlMly6ElPI.0R7K', 'eve@example.com', '5555555555', 'avatar3.jpg'),
(4, 'f', '1', '$2y$10$TQVnRudeZJzpn8GmfRIpAOdFEzNmdl3NukBzsk0AT3ucARivAaRk6', 'f@mail.com', '123', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course_content`
--
ALTER TABLE `course_content`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_courses`
--
ALTER TABLE `student_courses`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `course_content`
--
ALTER TABLE `course_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_courses`
--
ALTER TABLE `student_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
