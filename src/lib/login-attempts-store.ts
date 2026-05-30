import "server-only";

import { db } from "./db";
import { AttemptRecord, EMPTY } from "./login-throttle";

interface Row {
  ip: string;
  fails: number;
  first_fail_at: number;
  locked_until: number;
}

export function getAttempts(ip: string): AttemptRecord {
  const row = db
    .prepare(
      "SELECT ip, fails, first_fail_at, locked_until FROM login_attempts WHERE ip = ?"
    )
    .get(ip) as Row | undefined;
  if (!row) return { ...EMPTY };
  return {
    fails: row.fails,
    firstFailAt: row.first_fail_at,
    lockedUntil: row.locked_until,
  };
}

export function saveAttempts(ip: string, rec: AttemptRecord): void {
  if (rec.fails === 0 && rec.lockedUntil === 0) {
    db.prepare("DELETE FROM login_attempts WHERE ip = ?").run(ip);
    return;
  }
  db.prepare(
    `INSERT INTO login_attempts (ip, fails, first_fail_at, locked_until)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(ip) DO UPDATE SET
       fails = excluded.fails,
       first_fail_at = excluded.first_fail_at,
       locked_until = excluded.locked_until`
  ).run(ip, rec.fails, rec.firstFailAt, rec.lockedUntil);
}
