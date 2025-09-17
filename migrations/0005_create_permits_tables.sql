
-- Migration number: 0005    2025-01-01T00:04:00.000Z

-- Main table to store the current state of all permits
DROP TABLE IF EXISTS permits;
CREATE TABLE permits (
    permit_number TEXT PRIMARY KEY,
    permit_type TEXT NOT NULL,
    status TEXT,
    description TEXT,
    address TEXT,
    issue_date DATE,
    estimated_cost REAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data TEXT -- Store the raw JSON object for future-proofing
);

-- Table to log all historical changes to permits
DROP TABLE IF EXISTS permit_history;
CREATE TABLE permit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permit_number TEXT NOT NULL,
    changed_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permit_number) REFERENCES permits(permit_number) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_permits_type ON permits(permit_type);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permit_history_permit_number ON permit_history(permit_number);
