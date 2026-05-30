"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  authConfigured,
  passwordMatches,
  createSession,
  deleteSession,
} from "@/lib/session";
import {
  getAttempts,
  saveAttempts,
} from "@/lib/login-attempts-store";
import {
  isLocked,
  lockRemainingMs,
  registerAttempt,
} from "@/lib/login-throttle";

export interface LoginState {
  error?: string;
}

/** Identifie le client derrière le reverse proxy (sinon "local"). */
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "local";
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!authConfigured()) {
    return {
      error:
        "Aucun mot de passe configuré sur le serveur (variable HOUSEHOLD_PASSWORD).",
    };
  }

  const ip = await clientIp();
  const now = Date.now();
  const record = getAttempts(ip);

  if (isLocked(record, now)) {
    const minutes = Math.ceil(lockRemainingMs(record, now) / 60000);
    return {
      error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    };
  }

  const ok = passwordMatches(password);
  saveAttempts(ip, registerAttempt(record, ok, now));

  if (!ok) {
    return { error: "Mot de passe incorrect." };
  }

  await createSession();
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
