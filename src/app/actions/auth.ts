"use server";

import { redirect } from "next/navigation";
import {
  authConfigured,
  passwordMatches,
  createSession,
  deleteSession,
} from "@/lib/session";

export interface LoginState {
  error?: string;
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
  if (!passwordMatches(password)) {
    return { error: "Mot de passe incorrect." };
  }

  await createSession();
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
