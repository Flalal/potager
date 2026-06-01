import { describe, it, expect } from "vitest";
import {
  shiftMonths,
  areIncompatible,
  monthlyTasks,
  plantsByActionForMonthAdjusted,
  monthToDecades,
  decadeMonth,
  decadePart,
  shiftDecades,
  decadesForAction,
  adjustedDecades,
} from "./calendar";
import { getPlantById, PLANTS } from "./plants";
import type { ActionType, Plant } from "./types";

describe("shiftMonths", () => {
  it("ne change rien avec offset 0", () => {
    expect(shiftMonths([1, 5, 12], 0)).toEqual([1, 5, 12]);
  });

  it("décale vers le mois suivant (nord, +1)", () => {
    expect(shiftMonths([3, 4], 1)).toEqual([4, 5]);
  });

  it("décale vers le mois précédent (sud, -1)", () => {
    expect(shiftMonths([3, 4], -1)).toEqual([2, 3]);
  });

  it("boucle décembre → janvier (+1)", () => {
    expect(shiftMonths([12], 1)).toEqual([1]);
  });

  it("boucle janvier → décembre (-1)", () => {
    expect(shiftMonths([1], -1)).toEqual([12]);
  });

  it("déduplique et trie", () => {
    expect(shiftMonths([12, 11], 1)).toEqual([1, 12]);
  });
});

describe("areIncompatible", () => {
  it("détecte tomate / pomme de terre comme incompatibles", () => {
    const tomate = getPlantById("tomate")!;
    const pdt = getPlantById("pomme-de-terre")!;
    expect(tomate).toBeDefined();
    expect(pdt).toBeDefined();
    expect(areIncompatible(tomate, pdt)).toBe(true);
  });

  it("une plante n'est pas incompatible avec elle-même", () => {
    const tomate = getPlantById("tomate")!;
    expect(areIncompatible(tomate, tomate)).toBe(false);
  });
});

describe("monthlyTasks", () => {
  it("signale la récolte le mois de récolte", () => {
    const plant = PLANTS.find((p) => p.recolte.length > 0)!;
    const month = plant.recolte[0];
    const tasks = monthlyTasks(plant, month, 0);
    expect(tasks.some((t) => t.kind === "recolte")).toBe(true);
  });

  it("propose un arrosage l'été pour un besoin en eau élevé", () => {
    const plant: Plant = {
      ...PLANTS[0],
      besoinEau: "eleve",
      recolte: [],
      soins: [],
    };
    const tasks = monthlyTasks(plant, 7, 0); // juillet
    expect(tasks.some((t) => t.kind === "arrosage")).toBe(true);
  });
});

describe("décades", () => {
  it("monthToDecades découpe un mois en 3 (début/mi/fin)", () => {
    expect(monthToDecades(1)).toEqual([1, 2, 3]);
    expect(monthToDecades(3)).toEqual([7, 8, 9]);
    expect(monthToDecades(12)).toEqual([34, 35, 36]);
  });

  it("decadeMonth retrouve le mois d'une décade", () => {
    expect(decadeMonth(1)).toBe(1);
    expect(decadeMonth(3)).toBe(1);
    expect(decadeMonth(7)).toBe(3);
    expect(decadeMonth(36)).toBe(12);
  });

  it("decadePart donne le tiers du mois (0=début, 2=fin)", () => {
    expect(decadePart(1)).toBe(0);
    expect(decadePart(2)).toBe(1);
    expect(decadePart(3)).toBe(2);
    expect(decadePart(7)).toBe(0);
  });

  it("shiftDecades décale de offset mois (×3 décades) et boucle", () => {
    // mi-mars (8) + 1 mois = mi-avril (11)
    expect(shiftDecades([8], 1)).toEqual([11]);
    // fin décembre (36) + 1 mois = fin janvier (3)
    expect(shiftDecades([36], 1)).toEqual([3]);
    // début janvier (1) - 1 mois = début décembre (34)
    expect(shiftDecades([1], -1)).toEqual([34]);
    expect(shiftDecades([8], 0)).toEqual([8]);
  });

  it("decadesForAction développe les mois pleins quand pas de précision", () => {
    const plant: Plant = {
      ...PLANTS[0],
      semis: [3],
      semisD: undefined,
    };
    expect(decadesForAction(plant, "semis")).toEqual([7, 8, 9]);
  });

  it("decadesForAction privilégie la précision décadaire si fournie", () => {
    const plant: Plant = {
      ...PLANTS[0],
      semis: [3],
      semisD: [8, 9], // mi + fin mars seulement
    };
    expect(decadesForAction(plant, "semis")).toEqual([8, 9]);
  });

  it("adjustedDecades applique le décalage de zone", () => {
    const plant: Plant = { ...PLANTS[0], semis: [3], semisD: [8] };
    expect(adjustedDecades(plant, "semis", 1)).toEqual([11]);
  });

  it("invariant : les mois couverts par *D correspondent aux mois pleins", () => {
    const actions: ActionType[] = ["semis", "plantation", "recolte"];
    for (const plant of PLANTS) {
      for (const action of actions) {
        const fine =
          action === "semis"
            ? plant.semisD
            : action === "plantation"
              ? plant.plantationD
              : plant.recolteD;
        if (!fine || fine.length === 0) continue;
        const coarse = (
          action === "semis"
            ? plant.semis
            : action === "plantation"
              ? plant.plantation
              : plant.recolte
        )
          .slice()
          .sort((a, b) => a - b);
        const monthsFromFine = Array.from(
          new Set(fine.map(decadeMonth))
        ).sort((a, b) => a - b);
        expect(
          monthsFromFine,
          `${plant.id} / ${action} : décades incohérentes avec les mois`
        ).toEqual(coarse);
        // toutes les décades doivent être dans 1..36
        for (const d of fine) {
          expect(d).toBeGreaterThanOrEqual(1);
          expect(d).toBeLessThanOrEqual(36);
        }
      }
    }
  });
});

describe("plantsByActionForMonthAdjusted", () => {
  it("renvoie des plantes pour les semis de mai (tempéré)", () => {
    const res = plantsByActionForMonthAdjusted("semis", 5, 0);
    expect(res.length).toBeGreaterThan(0);
  });

  it("le décalage de zone modifie la liste", () => {
    const tempere = plantsByActionForMonthAdjusted("semis", 5, 0).length;
    const sud = plantsByActionForMonthAdjusted("semis", 5, -1).length;
    expect(tempere).not.toBe(sud);
  });
});
