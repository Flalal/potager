import "server-only";

import { db } from "./db";
import type { Plot } from "./plots";

interface Row {
  id: string;
  nom: string;
  rows: number;
  cols: number;
  cells: string;
  position: number;
}

function toPlot(r: Row): Plot {
  let cells: (string | null)[];
  try {
    cells = JSON.parse(r.cells);
  } catch {
    cells = [];
  }
  return { id: r.id, nom: r.nom, rows: r.rows, cols: r.cols, cells };
}

export function listPlots(): Plot[] {
  const rows = db
    .prepare(
      "SELECT id, nom, rows, cols, cells, position FROM plots ORDER BY position ASC, created_at ASC"
    )
    .all() as unknown as Row[];
  return rows.map(toPlot);
}

export function addPlot(plot: Plot): void {
  const max = db.prepare("SELECT MAX(position) AS m FROM plots").get() as
    | { m: number | null }
    | undefined;
  const position = (max?.m ?? -1) + 1;
  db.prepare(
    `INSERT INTO plots (id, nom, rows, cols, cells, position, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    plot.id,
    plot.nom,
    plot.rows,
    plot.cols,
    JSON.stringify(plot.cells),
    position,
    Date.now()
  );
}

export function updatePlot(
  id: string,
  patch: Partial<Omit<Plot, "id">>
): void {
  const current = db
    .prepare("SELECT id, nom, rows, cols, cells, position FROM plots WHERE id = ?")
    .get(id) as unknown as Row | undefined;
  if (!current) return;
  const merged = { ...toPlot(current), ...patch };
  db.prepare(
    "UPDATE plots SET nom = ?, rows = ?, cols = ?, cells = ? WHERE id = ?"
  ).run(
    merged.nom,
    merged.rows,
    merged.cols,
    JSON.stringify(merged.cells),
    id
  );
}

export function removePlot(id: string): void {
  db.prepare("DELETE FROM plots WHERE id = ?").run(id);
}
