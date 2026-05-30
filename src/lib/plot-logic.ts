import { PLANTS, getPlantById } from "./plants";
import { areIncompatible } from "./calendar";

/** Forme minimale d'un carré pour les calculs (sans dépendance au hook). */
export interface PlotShape {
  cells: (string | null)[];
  layouts: Record<string, (string | null)[]>;
  year: number;
}

export interface PlotTemplate {
  id: string;
  nom: string;
  description: string;
  rows: number;
  cols: number;
  cells: (string | null)[];
}

/** Plans tout faits, prêts à charger sans rien savoir. */
export const PLOT_TEMPLATES: PlotTemplate[] = [
  {
    id: "debutant",
    nom: "Carré du débutant",
    description: "Faciles et rapides : salade, radis, carotte…",
    rows: 3,
    cols: 3,
    cells: [
      "laitue", "radis", "carotte",
      "haricot-vert", "basilic", "tomate",
      "courgette", "betterave", "oignon",
    ],
  },
  {
    id: "tomates-basilic",
    nom: "Tomates & basilic",
    description: "Le duo gagnant de l'été, avec oignon et carotte.",
    rows: 2,
    cols: 4,
    cells: [
      "tomate", "basilic", "tomate", "basilic",
      "oignon", "carotte", "oignon", "carotte",
    ],
  },
  {
    id: "aromates",
    nom: "Carré d'aromates",
    description: "Toutes les herbes à portée de main.",
    rows: 2,
    cols: 3,
    cells: [
      "basilic", "persil", "ciboulette",
      "thym", "coriandre", "menthe",
    ],
  },
  {
    id: "automne",
    nom: "Carré d'automne",
    description: "Légumes de saison fraîche : poireau, mâche, épinard…",
    rows: 3,
    cols: 4,
    cells: [
      "poireau", "carotte", "poireau", "carotte",
      "navet", "mache", "navet", "mache",
      "laitue", "radis", "laitue", "radis",
    ],
  },
];

/**
 * Conflits de rotation : une case dont la famille a déjà été cultivée au même
 * endroit lors d'une des `withinYears` années précédentes.
 */
export function rotationConflicts(
  plot: PlotShape,
  withinYears = 3
): Set<number> {
  const res = new Set<number>();
  const cur = plot.cells;
  for (let i = 0; i < cur.length; i++) {
    const id = cur[i];
    if (!id) continue;
    const fam = getPlantById(id)?.famille;
    if (!fam) continue;
    for (let y = plot.year - 1; y >= plot.year - withinYears; y--) {
      const past = plot.layouts[String(y)];
      const pid = past?.[i];
      if (!pid) continue;
      if (getPlantById(pid)?.famille === fam) {
        res.add(i);
        break;
      }
    }
  }
  return res;
}

/** Minuscule + suppression des accents (sans regex de diacritiques). */
function normalize(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase().normalize("NFD")) {
    const c = ch.charCodeAt(0);
    if (c >= 0x300 && c <= 0x36f) continue; // marques diacritiques
    out += ch;
  }
  return out.split("/")[0].trim();
}

/** Résout un nom de compagnon (« Carotte ») vers un id du catalogue. */
function resolveByName(name: string): string | null {
  const n = normalize(name);
  if (n.length < 3) return null;
  const found = PLANTS.find((p) => {
    const pn = normalize(p.nom);
    return pn === n || pn.includes(n) || n.includes(pn);
  });
  return found ? found.id : null;
}

/**
 * Suggestions de bonnes voisines à ajouter : compagnons favorables des plantes
 * déjà placées, pas encore présentes et compatibles avec toutes les présentes.
 */
export function suggestionsForPlot(
  cells: (string | null)[],
  limit = 6
): string[] {
  const placed = cells.filter((c): c is string => Boolean(c));
  if (placed.length === 0) return [];
  const placedSet = new Set(placed);

  const candidates = new Set<string>();
  for (const id of placedSet) {
    const plant = getPlantById(id);
    if (!plant) continue;
    for (const name of plant.compagnonsFavorables) {
      const cid = resolveByName(name);
      if (cid && !placedSet.has(cid)) candidates.add(cid);
    }
  }

  const result: string[] = [];
  for (const cid of candidates) {
    const cand = getPlantById(cid);
    if (!cand) continue;
    const compatible = [...placedSet].every((pid) => {
      const p = getPlantById(pid);
      return p ? !areIncompatible(cand, p) : true;
    });
    if (compatible) result.push(cid);
    if (result.length >= limit) break;
  }
  return result;
}
