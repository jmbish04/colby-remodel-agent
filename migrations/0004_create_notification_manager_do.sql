
-- Migration number: 0004    2025-01-01T00:03:00.000Z
CREATE TABLE IF NOT EXISTS durable_object_namespaces (
    name TEXT PRIMARY KEY,
    class_name TEXT NOT NULL,
    script_name TEXT
);

INSERT INTO durable_object_namespaces (name, class_name)
VALUES ('NOTIFICATION_MANAGER', 'NotificationManager');
