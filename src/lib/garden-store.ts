import "server-only";

import { db } from "./db";
import type { Plantation } from "./garden";

interface Row {
  uid: string;
  plant_id: string;
  date_plantation: string;
  quantite: number;
  emplacement: string;
  notes: string;
}

function toPlantation(r: Row): Plantation {
  return {
    uid: r.uid,
    plantId: r.plant_id,
    datePlantation: r.date_plantation,
    quantite: r.quantite,
    emplacement: r.emplacement,
    notes: r.notes,
  };
}

export function listPlantations(): Plantation[] {
  const rows = db
    .prepare(
      "SELECT uid, plant_id, date_plantation, quantite, emplacement, notes FROM plantations ORDER BY created_at ASC"
    )
    .all() as unknown as Row[];
  return rows.map(toPlantation);
}

export function addPlantation(p: Plantation): void {
  db.prepare(
    `INSERT INTO plantations (uid, plant_id, date_plantation, quantite, emplacement, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    p.uid,
    p.plantId,
    p.datePlantation ?? "",
    p.quantite ?? 1,
    p.emplacement ?? "",
    p.notes ?? "",
    Date.now()
  );
}

export function updatePlantation(
  uid: string,
  patch: Partial<Omit<Plantation, "uid">>
): void {
  const current = db
    .prepare(
      "SELECT uid, plant_id, date_plantation, quantite, emplacement, notes FROM plantations WHERE uid = ?"
    )
    .get(uid) as unknown as Row | undefined;
  if (!current) return;
  const merged = { ...toPlantation(current), ...patch };
  db.prepare(
    `UPDATE plantations
       SET plant_id = ?, date_plantation = ?, quantite = ?, emplacement = ?, notes = ?
     WHERE uid = ?`
  ).run(
    merged.plantId,
    merged.datePlantation,
    merged.quantite,
    merged.emplacement,
    merged.notes,
    uid
  );
}

export function removePlantation(uid: string): void {
  db.prepare("DELETE FROM plantations WHERE uid = ?").run(uid);
}
