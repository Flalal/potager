import type { Plant } from "./types";

/**
 * Liens d'achat des graines / plants, construits à partir du nom de la plante.
 * On ne stocke pas de prix : on pointe vers un comparateur (Google Shopping) et
 * quelques marchands pour trouver le moins cher.
 */

export interface BuyLink {
  label: string;
  url: string;
  /** vrai pour le comparateur de prix (mis en avant) */
  compare?: boolean;
}

/** Terme de recherche propre : « graines de X » (ou « plant de X » pour un fruit). */
export function searchTerm(plant: Plant): string {
  const nom = plant.nom.split("/")[0].trim();
  const prefix = plant.category === "fruit" ? "plant de" : "graines de";
  return `${prefix} ${nom}`;
}

export function buyLinks(plant: Plant): BuyLink[] {
  const q = encodeURIComponent(searchTerm(plant));
  return [
    {
      label: "Comparer les prix",
      url: `https://www.google.com/search?tbm=shop&hl=fr&q=${q}`,
      compare: true,
    },
    { label: "Amazon", url: `https://www.amazon.fr/s?k=${q}` },
    {
      label: "Graines Baumaux",
      url: `https://www.graines-baumaux.fr/p/recherche.html?recherche=${q}`,
    },
    {
      label: "Recherche web",
      url: `https://www.google.com/search?hl=fr&q=${q}+pas+cher`,
    },
  ];
}
