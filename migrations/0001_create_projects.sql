-- Migration number: 0001    2025-01-01T00:00:00.000Z
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget_amount DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
    AFTER UPDATE ON projects
    BEGIN
        UPDATE projects 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
