# db.py — Database helpers for PrepBoard

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "prepboard.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "models.sql")


def get_connection() -> sqlite3.Connection:
    """Return a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create tables from models.sql if they don't exist."""
    conn = get_connection()
    with open(SCHEMA_PATH, "r") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("[DB] Database initialised successfully.")


# ── Roles ──────────────────────────────────────────────────────────────────────

def fetch_all_roles() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM roles ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def fetch_role_by_id(role_id: int) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM roles WHERE id = ?", (role_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_role(name: str) -> dict:
    """Insert a new role (or return existing one if name taken)."""
    conn = get_connection()
    try:
        conn.execute("INSERT INTO roles (name) VALUES (?)", (name,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass  # role already exists — that's fine
    row = conn.execute("SELECT * FROM roles WHERE name = ? COLLATE NOCASE", (name,)).fetchone()
    conn.close()
    return dict(row)


# ── Topics ─────────────────────────────────────────────────────────────────────

def fetch_topics_by_role(role_id: int) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM topics WHERE role_id = ? ORDER BY created_at DESC",
        (role_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_topic(role_id: int, title: str, category: str,
                 status: str, notes: str, confidence: int) -> dict:
    conn = get_connection()
    conn.execute(
        """INSERT INTO topics (role_id, title, category, status, notes, confidence)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (role_id, title, category, status, notes, confidence)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM topics WHERE rowid = last_insert_rowid()").fetchone()
    conn.close()
    return dict(row)


def update_topic(topic_id: int, title: str, category: str,
                 status: str, notes: str, confidence: int) -> dict | None:
    conn = get_connection()
    conn.execute(
        """UPDATE topics
           SET title=?, category=?, status=?, notes=?, confidence=?
           WHERE id=?""",
        (title, category, status, notes, confidence, topic_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_topic(topic_id: int) -> bool:
    conn = get_connection()
    cur = conn.execute("DELETE FROM topics WHERE id=?", (topic_id,))
    conn.commit()
    conn.close()
    return cur.rowcount > 0


# ── Analytics ──────────────────────────────────────────────────────────────────

def fetch_analytics(role_id: int) -> dict:
    """Return aggregated stats for charts."""
    conn = get_connection()
    topics = [dict(r) for r in
              conn.execute("SELECT * FROM topics WHERE role_id=?", (role_id,)).fetchall()]
    conn.close()

    status_counts = {"Not Started": 0, "In Progress": 0, "Done": 0}
    category_counts: dict[str, int] = {}
    confidence_dist = [0] * 6      # index 0-5

    for t in topics:
        status_counts[t["status"]] = status_counts.get(t["status"], 0) + 1
        cat = t["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        conf = t["confidence"] or 0
        confidence_dist[conf] += 1

    total = len(topics)
    done = status_counts["Done"]
    completion_pct = round((done / total) * 100) if total else 0

    return {
        "total": total,
        "completion_pct": completion_pct,
        "status_counts": status_counts,
        "category_counts": category_counts,
        "confidence_dist": confidence_dist,
    }
