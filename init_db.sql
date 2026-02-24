-- Skema database untuk Lokerin
CREATE DATABASE IF NOT EXISTS lokerin_db;

USE lokerin_db;

-- Tabel pengguna
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'recruiter', 'admin') DEFAULT 'candidate',
    avatar TEXT,
    job_title VARCHAR(255),
    company VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    skills TEXT,
    evidences JSON,
    access_list JSON,
    requests JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel lowongan pekerjaan
CREATE TABLE IF NOT EXISTS job_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company_id INT,
    posted_by INT,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    location VARCHAR(255),
    job_type ENUM('fulltime', 'parttime', 'contract', 'internship'),
    experience_level ENUM('entry', 'mid', 'senior', 'executive'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES users(id)
);

-- Tabel lamaran pekerjaan
CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    applicant_id INT,
    cover_letter TEXT,
    resume_path VARCHAR(500),
    status ENUM('submitted', 'reviewed', 'accepted', 'rejected') DEFAULT 'submitted',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_postings(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id)
);

-- Tabel notifikasi
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contoh data awal
INSERT IGNORE INTO users (name, email, password, role, avatar, job_title, company, is_verified) VALUES
('Admin', 'admin@lokerin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'https://ui-avatars.com/api/?name=Admin', 'System Admin', 'Lokerin Inc.', TRUE);

INSERT IGNORE INTO users (name, email, password, role, avatar, job_title, company, is_verified) VALUES
('HRD Company', 'hrd@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'recruiter', 'https://ui-avatars.com/api/?name=HRD', 'HRD', 'PT Maju Jaya', TRUE);

INSERT IGNORE INTO users (name, email, password, role, avatar, job_title, company) VALUES
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'candidate', 'https://ui-avatars.com/api/?name=John', 'Software Engineer', NULL);