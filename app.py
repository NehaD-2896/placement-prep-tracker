from flask import Flask, request, jsonify, render_template
import os
import db as database
from flask_cors import CORS

# template_folder='.' tells Flask to look for index.html in your main folder
app = Flask(__name__, template_folder='.')
CORS(app)

# ── Home Route ────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    """Serves the main dashboard/home page."""
    return render_template('index.html')

# ── Roles API ─────────────────────────────────────────────────────────────────
@app.route("/api/roles", methods=["GET"])
def get_roles():
    """Get all roles."""
    return jsonify(database.fetch_roles())

@app.route("/api/roles", methods=["POST"])
def add_role():
    """Add a new role."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Role name is required"}), 400
    role = database.create_role(name)
    return jsonify(role), 201

# ── Topics API ────────────────────────────────────────────────────────────────
@app.route("/api/roles/<int:role_id>/topics", methods=["GET"])
def get_topics(role_id):
    """Get all topics for a role."""
    return jsonify(database.fetch_topics_by_role(role_id))

@app.route("/api/topics", methods=["POST"])
def add_topic():
    """Add a new topic to a role."""
    data = request.get_json(silent=True) or {}
    required = ["role_id", "title"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    
    topic = database.create_topic(
        role_id=int(data["role_id"]),
        title=data["title"].strip(),
        category=data.get("category", "General").strip() or "General",
        status=data.get("status", "Not Started"),
        notes=data.get("notes", "").strip(),
        confidence=int(data.get("confidence", 0)),
    )
    return jsonify(topic), 201

@app.route("/api/topics/<int:topic_id>", methods=["PUT"])
def edit_topic(topic_id):
    """Update an existing topic."""
    data = request.get_json(silent=True) or {}
    topic = database.update_topic(
        topic_id=topic_id,
        title=data.get("title", "").strip(),
        category=data.get("category", "General").strip() or "General",
        status=data.get("status", "Not Started"),
        notes=data.get("notes", "").strip(),
        confidence=int(data.get("confidence", 0)),
    )
    if not topic:
        return jsonify({"error": "Topic not found"}), 404
    return jsonify(topic)

@app.route("/api/topics/<int:topic_id>", methods=["DELETE"])
def remove_topic(topic_id):
    """Delete a topic."""
    ok = database.delete_topic(topic_id)
    if not ok:
        return jsonify({"error": "Topic not found"}), 404
    return jsonify({"message": "Deleted successfully"})

# ── Analytics API ──────────────────────────────────────────────────────────────
@app.route("/api/roles/<int:role_id>/analytics", methods=["GET"])
def get_analytics(role_id):
    """Return aggregated analytics for charts."""
    return jsonify(database.fetch_analytics(role_id))

# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    database.init_db()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
