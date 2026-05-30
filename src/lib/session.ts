import "server-only";

import { cookies } from "next/headers";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { db } from "./db";

export const SESSION_COOKIE = "potager_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

/** Mot de passe foyer attendu (clair en variable d'env, usage domestique). */
function expectedPassword(): string | null {
  return process.env.HOUSEHOLD_PASSWORD || null;
}

/** Comparaison à temps constant pour éviter de fuiter via le timing. */
export function passwordMatches(input: string): boolean {
  const expected = expectedPassword();
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** L'auth est-elle configurée (mot de passe défini) ? */
export function authConfigured(): boolean {
  return expectedPassword() !== null;
}

function purgeExpired(): void {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
}

/** Crée une session en base et pose le cookie httpOnly. */
export async function createSession(): Promise<void> {
  purgeExpired();
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  db.prepare(
    "INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)"
  ).run(token, now, expiresAt);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Vérifie la session en base (mémoïsé le temps d'un rendu). */
export const verifySession = cache(async (): Promise<boolean> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const row = db
    .prepare("SELECT expires_at FROM sessions WHERE token = ?")
    .get(token) as { expires_at: number } | undefined;
  if (!row) return false;
  if (row.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return false;
  }
  return true;
});

/** Supprime la session courante (déconnexion). */
export async function deleteSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  store.delete(SESSION_COOKIE);
}
