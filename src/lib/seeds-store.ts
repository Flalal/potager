import "server-only";

import { db } from "./db";

export function listSeeds(): string[] {
  const rows = db.prepare("SELECT plant_id FROM seeds").all() as unknown as {
    plant_id: string;
  }[];
  return rows.map((r) => r.plant_id);
}

export function setSeed(plantId: string, has: boolean): void {
  if (has) {
    db.prepare(
      "INSERT INTO seeds (plant_id, created_at) VALUES (?, ?) ON CONFLICT(plant_id) DO NOTHING"
    ).run(plantId, Date.now());
  } else {
    db.prepare("DELETE FROM seeds WHERE plant_id = ?").run(plantId);
  }
}
