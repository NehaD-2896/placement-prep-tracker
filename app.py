# app.py — PrepBoard Flask Backend

from flask import Flask, jsonify, request, send_from_directory
import db as database
import os

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), "static"))


# ── Page Routes ────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/dashboard")
def dashboard():
    return send_from_directory(app.static_folder, "dashboard.html")


# ── Roles API ──────────────────────────────────────────────────────────────────

@app.route("/api/roles", methods=["GET"])
def get_roles():
    """Return all roles."""
    return jsonify(database.fetch_all_roles())


@app.route("/api/roles/<int:role_id>", methods=["GET"])
def get_role(role_id):
    """Return a single role by ID."""
    role = database.fetch_role_by_id(role_id)
    if not role:
        return jsonify({"error": "Role not found"}), 404
    return jsonify(role)


@app.route("/api/roles", methods=["POST"])
def add_role():
    """Create or fetch an existing role."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Role name is required"}), 400
    role = database.create_role(name)
    return jsonify(role), 201


# ── Topics API ─────────────────────────────────────────────────────────────────

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
