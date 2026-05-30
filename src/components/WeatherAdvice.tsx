"use client";

import { useCallback, useEffect, useState } from "react";
import {
  openMeteoUrl,
  geocodeUrl,
  firstGeocode,
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

interface SavedGeo {
  lat: number;
  lon: number;
  label?: string;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; summary: ForecastSummary; label: string }
  | { kind: "error"; message: string };

function readSaved(): SavedGeo | null {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    return raw ? (JSON.parse(raw) as SavedGeo) : null;
  } catch {
    return null;
  }
}

function save(geo: SavedGeo) {
  try {
    localStorage.setItem(GEO_KEY, JSON.stringify(geo));
  } catch {
    // ignore
  }
}

export default function WeatherAdvice() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [city, setCity] = useState("");

  const load = useCallback(async (lat: number, lon: number, label: string) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch(openMeteoUrl(lat, lon));
      if (!res.ok) throw new Error("Météo indisponible");
      const summary = summarize(await res.json());
      if (!summary) throw new Error("Données météo incomplètes");
      setState({ kind: "ready", summary, label });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }, []);

  const searchCity = useCallback(
    async (name: string) => {
      const q = name.trim();
      if (!q) return;
      setState({ kind: "loading" });
      try {
        const res = await fetch(geocodeUrl(q));
        if (!res.ok) throw new Error("Recherche de ville impossible");
        const place = firstGeocode(await res.json());
        if (!place) {
          setState({ kind: "error", message: `Ville « ${q} » introuvable` });
          return;
        }
        save({ lat: place.lat, lon: place.lon, label: place.label });
        load(place.lat, place.lon, place.label);
      } catch (e) {
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [load]
  );

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ kind: "error", message: "Géolocalisation non disponible" });
      return;
    }
    setState({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo: SavedGeo = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: "Ma position",
        };
        save(geo);
        load(geo.lat, geo.lon, geo.label!);
      },
      () => setState({ kind: "error", message: "Localisation refusée" }),
      { maximumAge: 3_600_000, timeout: 10_000 }
    );
  }, [load]);

  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      // Différé hors de la phase synchrone de l'effet.
      queueMicrotask(() =>
        load(saved.lat, saved.lon, saved.label ?? "Position enregistrée")
      );
    }
  }, [load]);

  const advice =
    state.kind === "ready" ? wateringAdvice(state.summary) : null;

  return (
    <div className="space-y-2">
      {/* Barre de localisation */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-emerald-800/80 dark:text-emerald-100/80">
          ⛅ Arrosage selon la météo
        </span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchCity(city);
          }}
          className="flex items-center gap-1"
        >
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Votre ville"
            className="w-36 rounded-lg border border-emerald-200 px-2 py-1 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
          />
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
          >
            OK
          </button>
        </form>
        <button
          onClick={locate}
          title="Utiliser ma position"
          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
        >
          📍 Ma position
        </button>
        {state.kind === "ready" && (
          <span className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
            {state.label}
          </span>
        )}
      </div>

      {state.kind === "loading" && (
        <p className="text-sm text-emerald-700/60 dark:text-emerald-300/60">
          Météo en cours…
        </p>
      )}

      {state.kind === "error" && (
        <p className="text-sm text-rose-600 dark:text-rose-300">
          {state.message}.
        </p>
      )}

      {advice && state.kind === "ready" && (
        <div className={`rounded-xl border p-4 ${LEVEL_STYLE[advice.level]}`}>
          <p className="flex items-center gap-2 font-semibold">
            <span className="text-lg">{LEVEL_EMOJI[advice.level]}</span>
            {advice.title}
          </p>
          <p className="mt-1 text-sm opacity-90">{advice.detail}</p>
          <p className="mt-2 text-xs opacity-70">
            Prévision 48 h : {state.summary.precipitationMm.toFixed(1)} mm de
            pluie, max {Math.round(state.summary.tempMaxC)} °C.
          </p>
        </div>
      )}
    </div>
  );
}
