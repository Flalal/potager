import { describe, it, expect } from "vitest";
import {
  EMPTY,
  registerAttempt,
  isLocked,
  lockRemainingMs,
  MAX_FAILS,
  WINDOW_MS,
  LOCK_MS,
} from "./login-throttle";

const T0 = 1_000_000;

describe("registerAttempt", () => {
  it("un succès réinitialise l'état", () => {
    const rec = { fails: 3, firstFailAt: T0, lockedUntil: 0 };
    expect(registerAttempt(rec, true, T0)).toEqual(EMPTY);
  });

  it("incrémente les échecs dans la fenêtre", () => {
    let rec = EMPTY;
    rec = registerAttempt(rec, false, T0);
    rec = registerAttempt(rec, false, T0 + 1000);
    expect(rec.fails).toBe(2);
    expect(rec.lockedUntil).toBe(0);
  });

  it("verrouille après MAX_FAILS échecs", () => {
    let rec = EMPTY;
    let now = T0;
    for (let i = 0; i < MAX_FAILS; i++) {
      rec = registerAttempt(rec, false, now);
      now += 1000;
    }
    expect(rec.fails).toBe(MAX_FAILS);
    expect(isLocked(rec, now)).toBe(true);
    expect(lockRemainingMs(rec, T0 + 1000)).toBeGreaterThan(0);
  });

  it("réinitialise le compteur si la fenêtre a expiré", () => {
    let rec = registerAttempt(EMPTY, false, T0);
    rec = registerAttempt(rec, false, T0 + WINDOW_MS + 1);
    expect(rec.fails).toBe(1);
  });

  it("le verrou expire après LOCK_MS", () => {
    let rec = EMPTY;
    let now = T0;
    for (let i = 0; i < MAX_FAILS; i++) {
      rec = registerAttempt(rec, false, now);
      now += 1000;
    }
    expect(isLocked(rec, rec.lockedUntil + 1)).toBe(false);
    expect(isLocked(rec, rec.lockedUntil - 1)).toBe(true);
    expect(rec.lockedUntil).toBeGreaterThanOrEqual(T0 + LOCK_MS);
  });
});
