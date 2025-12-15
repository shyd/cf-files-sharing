CREATE TABLE files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    path TEXT,
    size INTEGER NOT NULL,
    storage_type TEXT NOT NULL,
    preview_enabled INTEGER
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    content BLOB
);

CREATE INDEX idx_created_at ON files(created_at);
