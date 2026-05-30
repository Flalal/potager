import { describe, it, expect } from "vitest";
import {
  PLOT_TEMPLATES,
  rotationConflicts,
  suggestionsForPlot,
} from "./plot-logic";
import { getPlantById } from "./plants";

describe("PLOT_TEMPLATES", () => {
  it("ne référencent que des plantes existantes et la bonne taille", () => {
    for (const t of PLOT_TEMPLATES) {
      expect(t.cells.length).toBe(t.rows * t.cols);
      for (const id of t.cells) {
        if (id) expect(getPlantById(id), `${t.id}:${id}`).toBeDefined();
      }
    }
  });
});

describe("rotationConflicts", () => {
  it("alerte si la même famille était au même endroit l'an passé", () => {
    // tomate (Solanacées) en case 0 cette année ET l'an dernier
    const plot = {
      year: 2026,
      cells: ["tomate", null],
      layouts: {
        "2025": ["poivron", null], // poivron = Solanacées aussi
        "2026": ["tomate", null],
      },
    };
    const res = rotationConflicts(plot);
    expect(res.has(0)).toBe(true);
  });

  it("pas d'alerte si famille différente", () => {
    const plot = {
      year: 2026,
      cells: ["carotte", null],
      layouts: { "2025": ["laitue", null], "2026": ["carotte", null] },
    };
    expect(rotationConflicts(plot).size).toBe(0);
  });

  it("pas d'alerte au-delà de la fenêtre d'années", () => {
    const plot = {
      year: 2026,
      cells: ["tomate"],
      layouts: { "2020": ["tomate"], "2026": ["tomate"] },
    };
    expect(rotationConflicts(plot, 3).size).toBe(0);
  });
});

describe("suggestionsForPlot", () => {
  it("propose des compagnons compatibles non présents", () => {
    const sugg = suggestionsForPlot(["carotte"]);
    expect(Array.isArray(sugg)).toBe(true);
    expect(sugg).not.toContain("carotte");
  });

  it("rien à suggérer pour un carré vide", () => {
    expect(suggestionsForPlot([null, null])).toEqual([]);
  });
});
