import { describe, it, expect } from "vitest";
import {
  shiftMonths,
  areIncompatible,
  monthlyTasks,
  plantsByActionForMonthAdjusted,
} from "./calendar";
import { getPlantById, PLANTS } from "./plants";
import type { Plant } from "./types";

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
