import { Miniflare } from 'miniflare';

export async function createTestDB() {
  const mf = new Miniflare({
    modules: true,
    script: '',
    d1Databases: ['DB'],
  });

  const db = await mf.getD1Database('DB');

  // Create tables
  await db.exec(`CREATE TABLE projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL, description TEXT, address VARCHAR(500), status VARCHAR(50) NOT NULL DEFAULT 'planning', start_date DATE, end_date DATE, budget_amount DECIMAL(12,2), actual_cost DECIMAL(12,2) DEFAULT 0, progress_percentage INTEGER DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

  await db.exec(`CREATE TABLE contractors (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL, company VARCHAR(255), phone VARCHAR(20), email VARCHAR(255), specialty VARCHAR(100), hourly_rate DECIMAL(8,2), rating DECIMAL(3,2), notes TEXT, is_active BOOLEAN DEFAULT 1, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

  await db.exec(`CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, contractor_id INTEGER, title VARCHAR(255) NOT NULL, description TEXT, status VARCHAR(50) NOT NULL DEFAULT 'pending', priority VARCHAR(20) DEFAULT 'medium', estimated_hours DECIMAL(8,2), actual_hours DECIMAL(8,2), estimated_cost DECIMAL(10,2), actual_cost DECIMAL(10,2), due_date DATE, completed_date DATE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE, FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL)`);

  return { mf, db };
}

export async function cleanupTestDB(mf: Miniflare) {
  await mf.dispose();
}
