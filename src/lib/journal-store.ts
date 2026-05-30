import "server-only";

import { db } from "./db";
import type { JournalEntry, JournalType } from "./journal";

interface Row {
  id: string;
  date: string;
  type: string;
  plant_id: string;
  titre: string;
  note: string;
  quantite: number | null;
  unite: string;
}

function toEntry(r: Row): JournalEntry {
  return {
    id: r.id,
    date: r.date,
    type: r.type as JournalType,
    plantId: r.plant_id,
    titre: r.titre,
    note: r.note,
    quantite: r.quantite,
    unite: r.unite,
  };
}

export function listEntries(): JournalEntry[] {
  const rows = db
    .prepare(
      "SELECT id, date, type, plant_id, titre, note, quantite, unite FROM journal_entries ORDER BY date DESC, created_at DESC"
    )
    .all() as unknown as Row[];
  return rows.map(toEntry);
}

export function addEntry(e: JournalEntry): void {
  db.prepare(
    `INSERT INTO journal_entries (id, date, type, plant_id, titre, note, quantite, unite, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    e.id,
    e.date,
    e.type,
    e.plantId ?? "",
    e.titre ?? "",
    e.note ?? "",
    e.quantite ?? null,
    e.unite ?? "",
    Date.now()
  );
}

export function removeEntry(id: string): void {
  db.prepare("DELETE FROM journal_entries WHERE id = ?").run(id);
}
