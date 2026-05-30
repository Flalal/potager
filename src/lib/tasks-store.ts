import "server-only";

import { db } from "./db";

export function listDoneTasks(): string[] {
  const rows = db.prepare("SELECT key FROM task_done").all() as unknown as {
    key: string;
  }[];
  return rows.map((r) => r.key);
}

export function setTaskDone(key: string, done: boolean): void {
  if (done) {
    db.prepare(
      "INSERT INTO task_done (key, created_at) VALUES (?, ?) ON CONFLICT(key) DO NOTHING"
    ).run(key, Date.now());
  } else {
    db.prepare("DELETE FROM task_done WHERE key = ?").run(key);
  }
}
