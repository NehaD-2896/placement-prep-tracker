CREATE DATABASE placement_tracker;

USE placement_tracker;

CREATE TABLE dsa_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL,
    problems_solved INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Not Started'
);
