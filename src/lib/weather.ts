/**
 * Conseils d'arrosage à partir d'une prévision météo (logique pure, testable).
 * Les données viennent d'Open-Meteo (gratuit, sans clé) côté client.
 */

export type WaterLevel = "skip" | "ok" | "water" | "urgent";

export interface ForecastSummary {
  /** cumul de précipitations attendu sur la fenêtre (mm) */
  precipitationMm: number;
  /** température maximale attendue (°C) */
  tempMaxC: number;
}

export interface WateringAdvice {
  level: WaterLevel;
  title: string;
  detail: string;
}

const TEXT: Record<WaterLevel, { title: string; detail: string }> = {
  skip: {
    title: "Pas besoin d'arroser",
    detail: "De la pluie est prévue : laissez faire le ciel.",
  },
  ok: {
    title: "Arrosage léger si besoin",
    detail: "Un peu de pluie est attendue, surveillez la terre.",
  },
  water: {
    title: "Pensez à arroser",
    detail: "Temps sec à venir : un arrosage sera utile.",
  },
  urgent: {
    title: "Arrosez sans tarder",
    detail: "Chaud et sec : arrosez tôt le matin ou en soirée.",
  },
};

/**
 * Seuils (pour la fenêtre fournie, typiquement les prochaines 48 h) :
 * - ≥ 5 mm de pluie → inutile d'arroser
 * - chaud (≥ 28 °C) et quasi sec (< 1 mm) → urgent
 * - 1–5 mm → arrosage léger
 * - sinon → arroser
 */
export function wateringAdvice(f: ForecastSummary): WateringAdvice {
  let level: WaterLevel;
  if (f.precipitationMm >= 5) level = "skip";
  else if (f.tempMaxC >= 28 && f.precipitationMm < 1) level = "urgent";
  else if (f.precipitationMm >= 1) level = "ok";
  else level = "water";
  return { level, ...TEXT[level] };
}

/** URL Open-Meteo pour les cumuls de pluie et T° max des prochains jours. */
export function openMeteoUrl(lat: number, lon: number): string {
  const p = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lon.toFixed(3),
    daily: "precipitation_sum,temperature_2m_max",
    forecast_days: "2",
    timezone: "auto",
  });
  return `https://api.open-meteo.com/v1/forecast?${p.toString()}`;
}

interface OpenMeteoDaily {
  daily?: {
    precipitation_sum?: number[];
    temperature_2m_max?: number[];
  };
}

/** Agrège la réponse Open-Meteo en résumé exploitable. */
export function summarize(data: OpenMeteoDaily): ForecastSummary | null {
  const d = data.daily;
  if (!d?.precipitation_sum || !d?.temperature_2m_max) return null;
  const precipitationMm = d.precipitation_sum.reduce(
    (s, v) => s + (Number.isFinite(v) ? v : 0),
    0
  );
  const tempMaxC = Math.max(...d.temperature_2m_max.filter(Number.isFinite));
  return { precipitationMm, tempMaxC };
}
