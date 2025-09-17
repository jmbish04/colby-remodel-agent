-- Migration number: 0003    2025-01-01T00:02:00.000Z
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    contractor_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    due_date DATE,
    completed_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
    AFTER UPDATE ON tasks
    BEGIN
        UPDATE tasks 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Create indexes for better performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_contractor_id ON tasks(contractor_id);
CREATE INDEX idx_tasks_status ON tasks(status);
