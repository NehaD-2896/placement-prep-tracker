CREATE DATABASE placement_tracker;
USE placement_tracker;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100)
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    company VARCHAR(100),
    status VARCHAR(50),
    date DATE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE daily_prep (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    date DATE,
    dsa INT,
    subjects VARCHAR(255),
    hours INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
