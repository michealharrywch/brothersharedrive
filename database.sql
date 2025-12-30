CREATE DATABASE IF NOT EXISTS document_portal;
USE document_portal;

-- Drop table if exists (optional, for clean setup)
DROP TABLE IF EXISTS form_submissions;

-- Create the table with provider column
CREATE TABLE form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    provider VARCHAR(50),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_email ON form_submissions(email);
CREATE INDEX idx_provider ON form_submissions(provider);
CREATE INDEX idx_created_at ON form_submissions(created_at);