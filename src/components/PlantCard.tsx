import Link from "next/link";
import { Plant, CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";
import { ActionType } from "@/lib/types";
import { ACTION_COLORS } from "@/lib/calendar";
import { buyLinks } from "@/lib/shopping";
import PlantAvatar from "./PlantAvatar";

const DIFFICULTY_STYLE: Record<string, string> = {
  facile: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100",
  moyen: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
  difficile: "bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200",
};

export default function PlantCard({
  plant,
  badge,
}: {
  plant: Plant;
  badge?: ActionType;
}) {
  const compare = buyLinks(plant).find((l) => l.compare);

  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition hover:border-emerald-300 dark:hover:border-zinc-600 hover:shadow-md">
      <Link href={`/plantes/${plant.id}`} className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <PlantAvatar emoji={plant.emoji} category={plant.category} size="md" />
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_COLORS[badge].bg} ${ACTION_COLORS[badge].text}`}
            >
              {ACTION_COLORS[badge].label}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-emerald-900 dark:text-emerald-50 group-hover:text-emerald-700">
          {plant.nom}
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-emerald-50 dark:bg-zinc-800 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
            {CATEGORY_LABELS[plant.category]}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 ${DIFFICULTY_STYLE[plant.difficulty]}`}
          >
            {DIFFICULTY_LABELS[plant.difficulty]}
          </span>
        </div>
      </Link>
      {compare && (
        <a
          href={compare.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-300 dark:hover:bg-zinc-700"
        >
          🛒 Acheter
        </a>
      )}
    </div>
  );
}
