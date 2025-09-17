
import { z } from 'zod';

// --- Zod Schemas for SFGov API responses ---

const BuildingPermitSchema = z.object({
  permit_number: z.string(),
  permit_type_definition: z.string(),
  status: z.string().optional().nullable(),
  permit_creation_date: z.string(),
  issued_date: z.string().optional().nullable(),
  estimated_cost: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  location_1: z.object({
    latitude: z.string(),
    longitude: z.string(),
  }).optional().nullable(),
});
type BuildingPermit = z.infer<typeof BuildingPermitSchema>;

const ElectricalPermitSchema = z.object({
  permit_no: z.string(),
  permit_type_descr: z.string(),
  status_descr: z.string().optional().nullable(),
  date_opened: z.string(),
  date_issued: z.string().optional().nullable(),
  est_cost: z.string().optional().nullable(),
  work_descr: z.string().optional().nullable(),
});
type ElectricalPermit = z.infer<typeof ElectricalPermitSchema>;

// --- API Endpoints ---

const SFGOV_API_ENDPOINTS = {
  building: "https://data.sfgov.org/resource/p625-66b8.json",
  electrical: "https://data.sfgov.org/resource/y2ju-p625.json",
  // Plumbing and other endpoints can be added here
};

// --- Data Fetching and Processing Service ---

export class PermitIngestionService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async fetchFromEndpoint(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  normalizeBuildingPermit(permit: BuildingPermit) {
    return {
      permit_number: permit.permit_number,
      permit_type: permit.permit_type_definition,
      status: permit.status,
      description: permit.description,
      address: `Lat: ${permit.location_1?.latitude}, Lon: ${permit.location_1?.longitude}`,
      issue_date: permit.issued_date ? new Date(permit.issued_date).toISOString().split('T')[0] : null,
      estimated_cost: permit.estimated_cost ? parseFloat(permit.estimated_cost) : null,
      raw_data: JSON.stringify(permit),
    };
  }

  normalizeElectricalPermit(permit: ElectricalPermit) {
    return {
      permit_number: permit.permit_no,
      permit_type: permit.permit_type_descr,
      status: permit.status_descr,
      description: permit.work_descr,
      address: null, // Not available in this dataset
      issue_date: permit.date_issued ? new Date(permit.date_issued).toISOString().split('T')[0] : null,
      estimated_cost: permit.est_cost ? parseFloat(permit.est_cost) : null,
      raw_data: JSON.stringify(permit),
    };
  }

  async processPermits() {
    const buildingPermits = await this.fetchFromEndpoint(SFGOV_API_ENDPOINTS.building);
    const electricalPermits = await this.fetchFromEndpoint(SFGOV_API_ENDPOINTS.electrical);

    const validatedBuildingPermits = z.array(BuildingPermitSchema).parse(buildingPermits);
    const validatedElectricalPermits = z.array(ElectricalPermitSchema).parse(electricalPermits);

    const allPermits = [
      ...validatedBuildingPermits.map(this.normalizeBuildingPermit),
      ...validatedElectricalPermits.map(this.normalizeElectricalPermit),
    ];

    for (const permit of allPermits) {
      await this.updateOrCreatePermit(permit);
    }
  }

  async updateOrCreatePermit(permit: ReturnType<typeof this.normalizeBuildingPermit>) {
    const existingPermit = await this.db.prepare("SELECT * FROM permits WHERE permit_number = ?")
      .bind(permit.permit_number)
      .first();

    if (existingPermit) {
      // Logic to compare and log changes to permit_history
      const changes = this.comparePermits(existingPermit, permit);
      if (changes.length > 0) {
        const statements = changes.map(change => 
          this.db.prepare("INSERT INTO permit_history (permit_number, changed_field, old_value, new_value) VALUES (?, ?, ?, ?)")
            .bind(permit.permit_number, change.field, change.oldValue, change.newValue)
        );
        await this.db.batch(statements);

        // Update the main permit record
        await this.db.prepare(
          "UPDATE permits SET status = ?, description = ?, issue_date = ?, estimated_cost = ?, raw_data = ?, last_updated = CURRENT_TIMESTAMP WHERE permit_number = ?"
        ).bind(permit.status, permit.description, permit.issue_date, permit.estimated_cost, permit.raw_data, permit.permit_number).run();
      }
    } else {
      // Insert new permit
      await this.db.prepare(
        "INSERT INTO permits (permit_number, permit_type, status, description, address, issue_date, estimated_cost, raw_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        permit.permit_number,
        permit.permit_type,
        permit.status,
        permit.description,
        permit.address,
        permit.issue_date,
        permit.estimated_cost,
        permit.raw_data
      ).run();
    }
  }

  comparePermits(oldPermit: any, newPermit: any): { field: string, oldValue: any, newValue: any }[] {
    const changes = [];
    if (oldPermit.status !== newPermit.status) {
      changes.push({ field: 'status', oldValue: oldPermit.status, newValue: newPermit.status });
    }
    // Add other fields to compare as needed
    return changes;
  }
}
