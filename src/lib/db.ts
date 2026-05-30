import "server-only";

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Base SQLite via le module intégré `node:sqlite` (Node 22.5+/24).
 * Aucune dépendance native : se compile partout (dev Windows, LXC).
 *
 * La connexion est ouverte **paresseusement** (à la première requête, au
 * moment d'une requête HTTP) et non au chargement du module : cela évite que
 * les multiples workers du build ouvrent tous le fichier et se verrouillent.
 */

const DB_PATH =
  process.env.DATABASE_PATH || join(process.cwd(), "data", "potager.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS plantations (
  uid              TEXT PRIMARY KEY,
  plant_id         TEXT NOT NULL,
  date_plantation  TEXT NOT NULL DEFAULT '',
  quantite         INTEGER NOT NULL DEFAULT 1,
  emplacement      TEXT NOT NULL DEFAULT '',
  notes            TEXT NOT NULL DEFAULT '',
  created_at       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS plots (
  id          TEXT PRIMARY KEY,
  nom         TEXT NOT NULL,
  rows        INTEGER NOT NULL,
  cols        INTEGER NOT NULL,
  cells       TEXT NOT NULL,        -- JSON: (string|null)[]
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint    TEXT PRIMARY KEY,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip            TEXT PRIMARY KEY,
  fails         INTEGER NOT NULL DEFAULT 0,
  first_fail_at INTEGER NOT NULL DEFAULT 0,
  locked_until  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,
  type        TEXT NOT NULL,
  plant_id    TEXT NOT NULL DEFAULT '',
  titre       TEXT NOT NULL DEFAULT '',
  note        TEXT NOT NULL DEFAULT '',
  quantite    REAL,
  unite       TEXT NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS task_done (
  key         TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL
);
`;

/**
 * Migrations idempotentes (node:sqlite n'a pas de système de versions).
 * Chaque ALTER échoue silencieusement si la colonne existe déjà.
 */
function migrate(db: DatabaseSync) {
  const alters = [
    "ALTER TABLE plots ADD COLUMN year INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE plots ADD COLUMN layouts TEXT NOT NULL DEFAULT '{}'",
  ];
  for (const sql of alters) {
    try {
      db.exec(sql);
    } catch {
      // colonne déjà présente
    }
  }
}

function createDb(): DatabaseSync {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

const globalForDb = globalThis as unknown as { __potagerDb?: DatabaseSync };

function getDb(): DatabaseSync {
  if (!globalForDb.__potagerDb) {
    globalForDb.__potagerDb = createDb();
  }
  return globalForDb.__potagerDb;
}

/**
 * Proxy paresseux : `db.prepare(...)` ouvre la connexion au premier appel
 * réel, jamais au simple `import`.
 */
export const db: DatabaseSync = new Proxy({} as DatabaseSync, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function"
      ? (value as (...a: unknown[]) => unknown).bind(real)
      : value;
  },
});
