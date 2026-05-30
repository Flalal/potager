/**
 * Logique pure (sans I/O) de limitation des tentatives de connexion.
 * Testable isolément ; le stockage (DB) l'utilise pour faire évoluer l'état.
 */

export interface AttemptRecord {
  /** nombre d'échecs dans la fenêtre courante */
  fails: number;
  /** timestamp du premier échec de la fenêtre */
  firstFailAt: number;
  /** timestamp jusqu'auquel l'accès est verrouillé (0 = non verrouillé) */
  lockedUntil: number;
}

export const MAX_FAILS = 5;
export const WINDOW_MS = 15 * 60 * 1000; // fenêtre de comptage
export const LOCK_MS = 15 * 60 * 1000; // durée du verrou

export const EMPTY: AttemptRecord = {
  fails: 0,
  firstFailAt: 0,
  lockedUntil: 0,
};

/** Millisecondes de verrou restantes (0 si non verrouillé). */
export function lockRemainingMs(rec: AttemptRecord, now: number): number {
  return rec.lockedUntil > now ? rec.lockedUntil - now : 0;
}

/** L'accès est-il verrouillé à l'instant `now` ? */
export function isLocked(rec: AttemptRecord, now: number): boolean {
  return lockRemainingMs(rec, now) > 0;
}

/**
 * Nouvel état après une tentative.
 * - succès → réinitialise tout.
 * - échec → incrémente dans la fenêtre (réinitialisée si expirée) ; au-delà de
 *   MAX_FAILS, pose un verrou de LOCK_MS.
 */
export function registerAttempt(
  rec: AttemptRecord,
  success: boolean,
  now: number
): AttemptRecord {
  if (success) return { ...EMPTY };

  let { fails, firstFailAt } = rec;
  if (firstFailAt === 0 || now - firstFailAt > WINDOW_MS) {
    fails = 0;
    firstFailAt = now;
  }
  fails += 1;
  const lockedUntil = fails >= MAX_FAILS ? now + LOCK_MS : rec.lockedUntil;
  return { fails, firstFailAt, lockedUntil };
}
