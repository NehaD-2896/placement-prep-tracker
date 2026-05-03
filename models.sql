-- models.sql
-- PrepBoard: Interview Prep Tracker Schema

CREATE TABLE IF NOT EXISTS roles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id     INTEGER NOT NULL,
    title       TEXT    NOT NULL,
    category    TEXT    NOT NULL DEFAULT 'General',
    status      TEXT    NOT NULL DEFAULT 'Not Started'
                        CHECK(status IN ('Not Started','In Progress','Done')),
    notes       TEXT    DEFAULT '',
    confidence  INTEGER DEFAULT 0
                        CHECK(confidence BETWEEN 0 AND 5),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Trigger to auto-update updated_at on topic edit
CREATE TRIGGER IF NOT EXISTS update_topic_timestamp
    AFTER UPDATE ON topics
    FOR EACH ROW
    BEGIN
        UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

-- Seed some common roles for quick selection
INSERT OR IGNORE INTO roles (name) VALUES ('Software Development Engineer');
INSERT OR IGNORE INTO roles (name) VALUES ('Data Analyst');
INSERT OR IGNORE INTO roles (name) VALUES ('Product Manager');
INSERT OR IGNORE INTO roles (name) VALUES ('Business Analyst');
