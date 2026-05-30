import { shiftMonths } from "./calendar";
import type { Plant } from "./types";

/**
 * Mois de récolte prévisionnel à partir de la date de plantation réelle.
 * On prend le mois de récolte (ajusté à la zone) le plus proche en avançant
 * dans l'année depuis le mois de plantation. Renvoie 1-12, ou null.
 */
export function expectedHarvestMonth(
  plant: Plant,
  datePlantation: string,
  offset: number
): number | null {
  const rec = shiftMonths(plant.recolte, offset);
  if (rec.length === 0) return null;
  const d = new Date(datePlantation);
  if (Number.isNaN(d.getTime())) return null;
  const plantingMonth = d.getMonth() + 1;

  let best: number | null = null;
  let bestDist = 99;
  for (const m of rec) {
    const dist = (m - plantingMonth + 12) % 12;
    if (dist < bestDist) {
      bestDist = dist;
      best = m;
    }
  }
  return best;
}
