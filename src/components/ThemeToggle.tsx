"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mon-potager:theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // L'état réel est posé par le script anti-FOUC : on le lit au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage indisponible : on ignore
    }
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label="Basculer le thème"
      className="rounded-full px-2.5 py-1.5 text-sm text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-zinc-800"
    >
      {dark === null ? "🌗" : dark ? "☀️" : "🌙"}
    </button>
  );
}
