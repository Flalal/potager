"use client";

import { useActionState } from "react";
import { login, LoginState } from "@/app/actions/auth";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-5 text-center">
          <p className="text-4xl">🌻</p>
          <h1 className="mt-2 text-2xl font-bold text-emerald-900">
            Mon Potager
          </h1>
          <p className="mt-1 text-sm text-emerald-800/70">
            Entrez le mot de passe du foyer pour accéder à votre jardin.
          </p>
        </div>

        <form action={action} className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-emerald-700">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="mt-1 block w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </label>

          {state?.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
