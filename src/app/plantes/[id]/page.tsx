import Link from "next/link";
import { notFound } from "next/navigation";
import { PLANTS, getPlantById } from "@/lib/plants";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  EXPOSITION_LABELS,
  BESOIN_EAU_LABELS,
} from "@/lib/types";
import AddToGarden from "@/components/AddToGarden";
import PlantCalendar from "@/components/PlantCalendar";
import PlantAvatar from "@/components/PlantAvatar";

export function generateStaticParams() {
  return PLANTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/plantes/[id]">) {
  const { id } = await props.params;
  const plant = getPlantById(id);
  return { title: plant ? `${plant.nom} — Mon Potager` : "Plante introuvable" };
}

export default async function PlantePage(props: PageProps<"/plantes/[id]">) {
  const { id } = await props.params;
  const plant = getPlantById(id);
  if (!plant) notFound();

  const infos: { label: string; value: string }[] = [
    { label: "Catégorie", value: CATEGORY_LABELS[plant.category] },
    { label: "Difficulté", value: DIFFICULTY_LABELS[plant.difficulty] },
    { label: "Exposition", value: EXPOSITION_LABELS[plant.exposition] },
    { label: "Besoin en eau", value: BESOIN_EAU_LABELS[plant.besoinEau] },
    { label: "Arrosage", value: plant.arrosage },
    { label: "Sol", value: plant.sol },
    { label: "Espacement", value: plant.espacement },
    { label: "Temps de levée", value: plant.levee },
  ];

  return (
    <div className="space-y-6">
      <Link href="/plantes" className="text-sm text-emerald-600 hover:underline">
        ← Toutes les plantes
      </Link>

      <header className="flex flex-wrap items-center gap-4">
        <PlantAvatar emoji={plant.emoji} category={plant.category} size="lg" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-emerald-900">{plant.nom}</h1>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              {CATEGORY_LABELS[plant.category]}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              {DIFFICULTY_LABELS[plant.difficulty]}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              {EXPOSITION_LABELS[plant.exposition]}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              Famille : {plant.famille}
            </span>
          </div>
        </div>
        <AddToGarden plantId={plant.id} plantNom={plant.nom} />
      </header>

      <PlantCalendar plant={plant} />

      {/* Conseil débutant */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="mb-1 font-bold text-amber-900">💡 Conseil débutant</h2>
        <p className="text-sm text-amber-900/90">{plant.conseils}</p>
      </section>

      {/* Soins au fil de la saison */}
      {plant.soins.length > 0 && (
        <section className="rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="mb-3 font-bold text-emerald-900">
            🛠️ Entretien au fil de la saison
          </h2>
          <ul className="space-y-2">
            {plant.soins.map((soin, i) => (
              <li key={i} className="flex gap-2 text-sm text-emerald-900">
                <span className="text-emerald-500">•</span>
                <span>{soin.titre}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Infos culture */}
      <section className="grid gap-3 sm:grid-cols-2">
        {infos.map((info) => (
          <div
            key={info.label}
            className="rounded-xl border border-emerald-100 bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {info.label}
            </p>
            <p className="mt-1 text-sm text-emerald-900">{info.value}</p>
          </div>
        ))}
      </section>

      {/* Ravageurs */}
      <section className="rounded-xl border border-emerald-100 bg-white p-4">
        <h3 className="mb-2 font-bold text-emerald-800">
          🐛 Ravageurs &amp; maladies à surveiller
        </h3>
        {plant.ravageurs.length ? (
          <div className="flex flex-wrap gap-1.5">
            {plant.ravageurs.map((r) => (
              <span
                key={r}
                className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-orange-800"
              >
                {r}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-700/60">
            Pas de problème majeur connu.
          </p>
        )}
      </section>

      {/* Rotation */}
      <section className="rounded-xl border border-emerald-100 bg-white p-4">
        <h3 className="mb-1 font-bold text-emerald-800">🔄 Rotation des cultures</h3>
        <p className="text-sm text-emerald-900">
          Famille des <strong>{plant.famille}</strong>. Évitez de la cultiver au
          même endroit (ou après une autre plante de cette famille) avant 3 à 4
          ans, pour limiter maladies et épuisement du sol.
        </p>
      </section>

      {/* Compagnonnage */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-white p-4">
          <h3 className="mb-2 font-bold text-emerald-800">✅ Bons compagnons</h3>
          {plant.compagnonsFavorables.length ? (
            <div className="flex flex-wrap gap-1.5">
              {plant.compagnonsFavorables.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-700/60">
              Pas d&apos;association particulière.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-4">
          <h3 className="mb-2 font-bold text-rose-700">❌ À éviter à côté</h3>
          {plant.compagnonsDefavorables.length ? (
            <div className="flex flex-wrap gap-1.5">
              {plant.compagnonsDefavorables.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-rose-100 px-2.5 py-1 text-xs text-rose-800"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-700/60">
              Aucune incompatibilité connue.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
