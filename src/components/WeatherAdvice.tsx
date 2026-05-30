"use client";

import { useCallback, useEffect, useState } from "react";
import {
  openMeteoUrl,
  summarize,
  wateringAdvice,
  WaterLevel,
  ForecastSummary,
} from "@/lib/weather";

const GEO_KEY = "mon-potager:geo";

const LEVEL_STYLE: Record<WaterLevel, string> = {
  skip: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  ok: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  water:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  urgent:
    "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100",
};

const LEVEL_EMOJI: Record<WaterLevel, string> = {
  skip: "🌧️",
  ok: "🌦️",
  water: "💧",
  urgent: "🥵",
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; summary: ForecastSummary }
  | { kind: "denied" }
  | { kind: "error"; message: string };

function readSavedCoords(): { lat: number; lon: number } | null {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function WeatherAdvice() {
  const [state, setState] = useState<State>({ kind: "idle" });

  const load = useCallback(async (lat: number, lon: number) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch(openMeteoUrl(lat, lon));
      if (!res.ok) throw new Error("Météo indisponible");
      const summary = summarize(await res.json());
      if (!summary) throw new Error("Données météo incomplètes");
      setState({ kind: "ready", summary });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }, []);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ kind: "error", message: "Géolocalisation non disponible" });
      return;
    }
    setState({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        try {
          localStorage.setItem(GEO_KEY, JSON.stringify(coords));
        } catch {
          // ignore
        }
        load(coords.lat, coords.lon);
      },
      () => setState({ kind: "denied" }),
      { maximumAge: 3_600_000, timeout: 10_000 }
    );
  }, [load]);

  useEffect(() => {
    const saved = readSavedCoords();
    // Différé hors de la phase synchrone de l'effet (pas de setState direct).
    if (saved) queueMicrotask(() => load(saved.lat, saved.lon));
  }, [load]);

  if (state.kind === "idle" || state.kind === "denied") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-emerald-800/80 dark:text-emerald-100/80">
          ⛅ Conseils d&apos;arrosage selon la météo locale
        </span>
        <button
          onClick={locate}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
        >
          {state.kind === "denied"
            ? "Réessayer la localisation"
            : "Activer la localisation"}
        </button>
        {state.kind === "denied" && (
          <span className="text-xs text-rose-600 dark:text-rose-300">
            Localisation refusée.
          </span>
        )}
      </div>
    );
  }

  if (state.kind === "loading") {
    return (
      <p className="text-sm text-emerald-700/60 dark:text-emerald-300/60">
        Météo en cours…
      </p>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-rose-600 dark:text-rose-300">
          Météo indisponible ({state.message}).
        </span>
        <button
          onClick={locate}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const advice = wateringAdvice(state.summary);
  return (
    <div
      className={`rounded-xl border p-4 ${LEVEL_STYLE[advice.level]}`}
    >
      <p className="flex items-center gap-2 font-semibold">
        <span className="text-lg">{LEVEL_EMOJI[advice.level]}</span>
        {advice.title}
      </p>
      <p className="mt-1 text-sm opacity-90">{advice.detail}</p>
      <p className="mt-2 text-xs opacity-70">
        Prévision 48 h : {state.summary.precipitationMm.toFixed(1)} mm de pluie,
        max {Math.round(state.summary.tempMaxC)} °C.
      </p>
    </div>
  );
}
