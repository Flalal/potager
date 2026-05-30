"use client";

import { useEffect, useState } from "react";

const KEY = "mon-potager:onboarded";

const STEPS = [
  { emoji: "📍", text: "Choisissez votre région en haut (Nord / tempéré / Sud) : tout le calendrier s'y adapte." },
  { emoji: "📅", text: "Regardez « Ce mois-ci » pour savoir quoi semer, planter et récolter maintenant." },
  { emoji: "🟫", text: "Dans « Plan », partez d'un modèle tout fait pour dessiner votre potager." },
  { emoji: "🔔", text: "Activez les rappels dans « Mon jardin » pour ne rien oublier." },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      setShow(localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-50">
          👋 Bienvenue ! Premiers pas
        </h2>
        <button
          onClick={dismiss}
          className="rounded-full px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
        >
          Masquer
        </button>
      </div>
      <ol className="mt-3 space-y-2">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-emerald-900 dark:text-emerald-100"
          >
            <span className="text-lg leading-none">{s.emoji}</span>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
      <button
        onClick={dismiss}
        className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        J&apos;ai compris
      </button>
    </section>
  );
}
