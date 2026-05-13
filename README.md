# Placement Preparation Tracker (Full Stack)

A comprehensive web application designed to help students and developers organize their placement preparation. Unlike standard trackers, this app allows users to categorize their study progress by specific job roles (e.g., SDE-1, Data Analyst) and persists data using a backend database.

## 🚀 Features
- **Role-Based Tracking:** Create custom preparation paths for different job roles.
- **Dynamic Dashboard:** Real-time progress visualization using Chart.js.
- **Full CRUD Functionality:** Add, update, and delete topics and roles.
- **Persistent Storage:** Data is stored in a structured SQL database, not just browser cache.
- **RESTful API:** Decoupled architecture using Python Flask to bridge the frontend and database.

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend:** Python, Flask
- **Database:** SQLite (SQL)
- **Deployment Ready:** Gunicorn/WSGI compatible

## 📂 Project Structure
- `app.py`: Flask application handling API routes and server logic.
- `db.py`: Database connection and utility functions.
- `models.sql`: Relational database schema for Roles and Topics.
- `analytics.js`: Handles data fetching and chart rendering.
- `script.js`: Core frontend logic and API interactions.

## ⚙️ How to Run Locally
1. **Clone the repo:**
   ```bash
   git clone [https://github.com/NehaD-2896/placement-prep-tracker.git](https://github.com/NehaD-2896/placement-prep-tracker.git)


## 🚀 Live Demo
(https://nehad-2896.github.io/placement-prep-tracker)

