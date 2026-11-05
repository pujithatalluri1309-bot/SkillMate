-- =====================================================================================
-- SkillMate: Student Skill Exchange & Peer Learning System
-- Database Creation & Demonstration Script
-- Target RDBMS: MySQL 8.0+
-- Project Objective: Peer Tutoring, Teaching Video Evaluations & Student Earning System
-- =====================================================================================

DROP DATABASE IF EXISTS skillmate_db;
CREATE DATABASE skillmate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skillmate_db;

-- -------------------------------------------------------------------------------------
-- 1. Table: Students
-- Stores both learners and mentors. Every student can learn and teach.
-- -------------------------------------------------------------------------------------
CREATE TABLE Students (
    student_id VARCHAR(30) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    college_email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(80) NOT NULL,
    year_of_study ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    bio TEXT,
    is_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    account_status ENUM('Active', 'Suspended') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_email_format CHECK (college_email LIKE '%@%')
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 2. Table: Skills
-- Master catalog of subjects and technical skills offered on campus.
-- -------------------------------------------------------------------------------------
CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 3. Table: Student_Skills
-- Junction table mapping which students can teach which skills, with price & level.
-- -------------------------------------------------------------------------------------
CREATE TABLE Student_Skills (
    student_skill_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL,
    skill_id INT NOT NULL,
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    price_per_session DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    experience_notes VARCHAR(255),
    teaching_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_student_skill (student_id, skill_id),
    CONSTRAINT chk_skill_price CHECK (price_per_session >= 0)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 4. Table: Mentor_Videos
-- Teaching Demonstration Videos (2-5 mins) uploaded by mentors to prove ability.
-- -------------------------------------------------------------------------------------
CREATE TABLE Mentor_Videos (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    video_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255) DEFAULT NULL,
    duration_minutes DECIMAL(4, 2) NOT NULL,
    moderation_status ENUM('Active', 'Under Review', 'Flagged') NOT NULL DEFAULT 'Active',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_video_duration CHECK (duration_minutes >= 1.0 AND duration_minutes <= 15.0)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 5. Table: Video_Evaluations
-- 5-criteria rubric evaluation submitted by learners after watching demo video.
-- -------------------------------------------------------------------------------------
CREATE TABLE Video_Evaluations (
    evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    student_id VARCHAR(30) NOT NULL,
    subject_knowledge INT NOT NULL,
    communication_skills INT NOT NULL,
    explanation_clarity INT NOT NULL,
    confidence INT NOT NULL,
    practical_examples INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES Mentor_Videos(video_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_eval_scores CHECK (
        subject_knowledge BETWEEN 1 AND 5 AND
        communication_skills BETWEEN 1 AND 5 AND
        explanation_clarity BETWEEN 1 AND 5 AND
        confidence BETWEEN 1 AND 5 AND
        practical_examples BETWEEN 1 AND 5
    )
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 6. Table: Learning_Requests
-- Booking request sent by learner to mentor.
-- -------------------------------------------------------------------------------------
CREATE TABLE Learning_Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    learner_id VARCHAR(30) NOT NULL,
    mentor_id VARCHAR(30) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic_requirements TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    offered_price DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    rejection_reason VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_different_learner_mentor CHECK (learner_id <> mentor_id),
    CONSTRAINT chk_offered_price CHECK (offered_price >= 0)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 7. Table: Sessions
-- Scheduled 1-on-1 peer teaching sessions.
-- -------------------------------------------------------------------------------------
CREATE TABLE Sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL UNIQUE,
    learner_id VARCHAR(30) NOT NULL,
    mentor_id VARCHAR(30) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('Scheduled', 'In-Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    meeting_link VARCHAR(255) DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES Learning_Requests(request_id) ON DELETE RESTRICT,
    FOREIGN KEY (learner_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES Students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 8. Table: Feedback
-- Ratings and reviews left by learner after completed session. Prevents duplicates.
-- -------------------------------------------------------------------------------------
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL UNIQUE,
    learner_id VARCHAR(30) NOT NULL,
    mentor_id VARCHAR(30) NOT NULL,
    overall_rating INT NOT NULL,
    communication_rating INT NOT NULL,
    knowledge_rating INT NOT NULL,
    clarity_rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_ratings_range CHECK (
        overall_rating BETWEEN 1 AND 5 AND
        communication_rating BETWEEN 1 AND 5 AND
        knowledge_rating BETWEEN 1 AND 5 AND
        clarity_rating BETWEEN 1 AND 5
    )
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 9. Table: Payments
-- Tracks financial transactions in INR (₹) for booked sessions.
-- -------------------------------------------------------------------------------------
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    learner_id VARCHAR(30) NOT NULL,
    mentor_id VARCHAR(30) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    mentor_earnings DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('UPI', 'Card', 'NetBanking') NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_status ENUM('Success', 'Failed', 'Refunded') NOT NULL DEFAULT 'Success',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_amounts CHECK (amount = platform_fee + mentor_earnings)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 10. Table: Mentor_Earnings
-- Ledger tracking cumulative mentor wallet balance and earned income.
-- -------------------------------------------------------------------------------------
CREATE TABLE Mentor_Earnings (
    earning_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id VARCHAR(30) NOT NULL UNIQUE,
    total_gross_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_platform_fees DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_net_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_balances CHECK (available_balance >= 0)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 11. Table: Payouts
-- Mentor withdrawal requests to UPI ID or Bank Account.
-- -------------------------------------------------------------------------------------
CREATE TABLE Payouts (
    payout_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id VARCHAR(30) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payout_method ENUM('UPI', 'Bank Account') NOT NULL,
    payout_details VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Transferred', 'Rejected') NOT NULL DEFAULT 'Pending',
    remarks VARCHAR(255) DEFAULT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME DEFAULT NULL,
    FOREIGN KEY (mentor_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT chk_payout_amount CHECK (amount >= 100.00)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 12. Table: Notifications
-- In-app notifications for request updates, payment credits, and session reminders.
-- -------------------------------------------------------------------------------------
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Request', 'Session', 'Payment', 'Feedback', 'System') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES Students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- 13. Table: Admin_Users & Platform_Settings
-- Platform administrative configuration and commission rates.
-- -------------------------------------------------------------------------------------
CREATE TABLE Admin_Users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Platform_Settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    platform_commission_percent DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    min_session_price DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    max_session_price DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
    require_video_for_mentor BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- -------------------------------------------------------------------------------------
CREATE INDEX idx_student_email ON Students(college_email);
CREATE INDEX idx_student_department ON Students(department);
CREATE INDEX idx_student_skills_mentor ON Student_Skills(student_id);
CREATE INDEX idx_student_skills_price ON Student_Skills(price_per_session);
CREATE INDEX idx_requests_mentor ON Learning_Requests(mentor_id, status);
CREATE INDEX idx_requests_learner ON Learning_Requests(learner_id, status);
CREATE INDEX idx_sessions_dates ON Sessions(scheduled_date, scheduled_time);
CREATE INDEX idx_payments_mentor ON Payments(mentor_id);
CREATE INDEX idx_notifications_recipient ON Notifications(recipient_id, is_read);

-- -------------------------------------------------------------------------------------
-- DATABASE VIEWS
-- -------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_mentor_leaderboard AS
SELECT 
    s.student_id,
    s.full_name AS mentor_name,
    s.department,
    s.year_of_study,
    COUNT(DISTINCT sess.session_id) AS total_sessions_conducted,
    ROUND(AVG(f.overall_rating), 1) AS average_rating,
    COUNT(DISTINCT f.feedback_id) AS total_reviews,
    COALESCE(SUM(p.mentor_earnings), 0.00) AS total_net_earnings
FROM Students s
LEFT JOIN Sessions sess ON s.student_id = sess.mentor_id AND sess.status = 'Completed'
LEFT JOIN Feedback f ON s.student_id = f.mentor_id
LEFT JOIN Payments p ON s.student_id = p.mentor_id AND p.payment_status = 'Success'
WHERE s.is_mentor = TRUE
GROUP BY s.student_id, s.full_name, s.department, s.year_of_study;

-- -------------------------------------------------------------------------------------
-- STORED PROCEDURE: Complete Session and Credit Earnings (ACID Transaction)
-- -------------------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE sp_complete_session_and_credit_earnings(
    IN p_session_id INT,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_mentor_id VARCHAR(30);
    DECLARE v_learner_id VARCHAR(30);
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_platform_fee DECIMAL(10,2);
    DECLARE v_net_earning DECIMAL(10,2);
    DECLARE v_commission_pct DECIMAL(5,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'ERROR: Transaction rolled back due to SQL error.';
    END;

    START TRANSACTION;

    SELECT platform_commission_percent INTO v_commission_pct FROM Platform_Settings LIMIT 1;
    IF v_commission_pct IS NULL THEN
        SET v_commission_pct = 10.00;
    END IF;

    SELECT mentor_id, learner_id, price INTO v_mentor_id, v_learner_id, v_price
    FROM Sessions WHERE session_id = p_session_id;

    SET v_platform_fee = (v_price * v_commission_pct) / 100;
    SET v_net_earning = v_price - v_platform_fee;

    UPDATE Sessions
    SET status = 'Completed', completed_at = NOW()
    WHERE session_id = p_session_id;

    INSERT INTO Mentor_Earnings (mentor_id, total_gross_earnings, total_platform_fees, total_net_earnings, available_balance)
    VALUES (v_mentor_id, v_price, v_platform_fee, v_net_earning, v_net_earning)
    ON DUPLICATE KEY UPDATE
        total_gross_earnings = total_gross_earnings + v_price,
        total_platform_fees = total_platform_fees + v_platform_fee,
        total_net_earnings = total_net_earnings + v_net_earning,
        available_balance = available_balance + v_net_earning;

    COMMIT;
    SET p_status_message = 'SUCCESS: Session completed and earnings credited.';
END$$
DELIMITER ;
