CREATE DATABASE placement_tracker;
USE placement_tracker;

-- Table 1: The Job Roles
CREATE TABLE job_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL, -- e.g., "Amazon SDE Intern"
    company VARCHAR(100),
    application_status VARCHAR(50) DEFAULT 'Planning' 
);

-- Table 2: Daily Prep Tasks linked to a Role
CREATE TABLE prep_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    task_description VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES job_roles(id) ON DELETE CASCADE
);
