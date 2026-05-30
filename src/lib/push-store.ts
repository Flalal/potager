import "server-only";

import { db } from "./db";

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function savePushSub(sub: PushSub): void {
  db.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth`
  ).run(sub.endpoint, sub.keys.p256dh, sub.keys.auth, Date.now());
}

export function removePushSub(endpoint: string): void {
  db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(endpoint);
}

export function listPushSubs(): PushSub[] {
  const rows = db
    .prepare("SELECT endpoint, p256dh, auth FROM push_subscriptions")
    .all() as unknown as { endpoint: string; p256dh: string; auth: string }[];
  return rows.map((r) => ({
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh, auth: r.auth },
  }));
}
