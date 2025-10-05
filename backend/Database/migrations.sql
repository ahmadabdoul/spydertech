-- SQL Migrations for Teacher Revenue Sharing Feature

-- 1. Add wallet_balance and revenue_percentage to the teachers table
ALTER TABLE `teachers`
ADD COLUMN `wallet_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `avatar`,
ADD COLUMN `revenue_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 70.00 COMMENT 'Percentage of course price the teacher receives' AFTER `wallet_balance`;

-- 2. Create the transactions table
CREATE TABLE `transactions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `student_id` INT(11) NOT NULL,
  `course_id` INT(11) NOT NULL,
  `teacher_id` INT(11) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `teacher_revenue` DECIMAL(10, 2) NOT NULL,
  `transaction_type` ENUM('enrollment', 'withdrawal', 'refund') NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `fk_transactions_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;