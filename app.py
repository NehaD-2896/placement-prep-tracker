from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app) # Allows your HTML to talk to this Python script

# MySQL Connection Configuration
db_config = {
    'user': 'root',
    'password': 'your_password', # Change this!
    'host': 'localhost',
    'database': 'placement_tracker'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/topics', methods=['GET'])
def get_topics():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM dsa_topics")
    topics = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(topics)

@app.route('/add-topic', methods=['POST'])
def add_topic():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "INSERT INTO dsa_topics (topic_name, problems_solved, status) VALUES (%s, %s, %s)"
    cursor.execute(query, (data['topic'], data['count'], data['status']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Topic added successfully!"}), 201

if __name__ == '__main__':
    app.run(debug=True)
# Add this to your existing app.py
@app.route('/add-role', methods=['POST'])
def add_role():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO job_roles (role_name, company) VALUES (%s, %s)", 
                   (data['role_name'], data['company']))
    conn.commit()
    return jsonify({"message": "Role added!"})

@app.route('/get-roles', methods=['GET'])
def get_roles():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM job_roles")
    roles = cursor.fetchall()
    return jsonify(roles)
