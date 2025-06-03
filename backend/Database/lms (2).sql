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
  `teacher_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `teacher_id`) VALUES
(1, 'Introduction to Programming', 'Learn the basics of programming', 1),
(2, 'Web Development 101', 'Build interactive websites', 2),
(3, 'Data Science Fundamentals', 'Explore data analysis and visualization', 3),
(4, 'Civil Engineering Materials', 'Civil engineering is a professional engineering discipline that deals with the design, construction, and maintenance of the physical and naturally built environment, including public works such as roads, bridges, canals, dams, airports, sewage systems, pipelines, structural components of buildings, and railways.', 4);

-- --------------------------------------------------------

--
-- Table structure for table `course_content`
--

CREATE TABLE `course_content` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text DEFAULT NULL,
  `video_type` varchar(50) NOT NULL,
  `video_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_content`
--

INSERT INTO `course_content` (`id`, `course_id`, `title`, `content`, `video_type`, `video_url`) VALUES
(1, 1, 'Getting Started with Programming', 'Introduction to programming concepts', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(2, 1, 'Variables and Data Types', 'Learn about variables and data types in programming', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(3, 2, 'HTML and CSS Basics', 'Building blocks of web development', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(4, 2, 'JavaScript Fundamentals', 'Introduction to JavaScript programming', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(5, 3, 'Data Analysis Techniques', 'Explore various data analysis methods', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(6, 4, 'Introduction', 'Civil engineering is a professional engineering discipline that deals with the design, construction, and maintenance of the physical and naturally built environment, including public works such as roads, bridges, canals, dams, airports, sewage systems, pipelines, structural components of buildings, and railways.', 'url', 'https://joy1.videvo.net/videvo_files/video/free/video0454/large_watermarked/_import_6064a2d0ec2a62.28720221_preview.mp4'),
(7, 4, 'Cement', 'lorem ipsum', 'video', 'uploads/Begin_Again_2014_(2014)_BluRay_high_(fzmovies.net)_e9f83f64bc270027c86f6c3983fde30b.mp4');

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
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `cellphone`, `avatar`) VALUES
(1, 'Alice', 'Alice', '$2y$10$WdO9GgEh3d/WUIktItLDDuIaQ6MbXsK.7RHZmYvkg.RQwzES9.A4G', 'alice@example.com', '1234567890', 'avatar1.jpg'),
(2, 'Ahmad Abdul', 'ahmadabdoul', '$2y$10$DXCp.6iL/V7TLHUN4QofQ.Oo1pxzlhUE8.fFn9FqIxVKNqKZRjX2K', 'a@b.com', '08132154218', 'uploads/landing-car-removebg-preview.png'),
(3, 'Eve', 'Eve', '$2y$10$hVSLZZbzrdUOjrxROvppQ.BB7dAhQU2WNLG2vQVlMly6ElPI.0R7K', 'eve@example.com', '5555555555', 'avatar3.jpg'),
(4, 'Sani Yakubu', 'speedy', '$2y$10$TQVnRudeZJzpn8GmfRIpAOdFEzNmdl3NukBzsk0AT3ucARivAaRk6', 'f@mail.com', '123', 'uploads/landing-car-removebg-preview.png'),
(5, 'Ahmad Abdul', 'ahmadabdoul', '$2y$10$EKr3UJssJv7ndCX.4KIoe.nJ9fj1fTfhRtCYeMVdLh5OngUZtXeXK', 'a@b.com', '08132154218', NULL);

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
-- Indexes for table `course_qa`
--
ALTER TABLE `course_qa`
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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
