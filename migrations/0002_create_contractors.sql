-- Migration number: 0002    2025-01-01T00:01:00.000Z
DROP TABLE IF EXISTS contractors;

CREATE TABLE contractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    specialty VARCHAR(100),
    hourly_rate DECIMAL(8,2),
    rating DECIMAL(3,2),
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contractors_updated_at 
    AFTER UPDATE ON contractors
    BEGIN
        UPDATE contractors 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
