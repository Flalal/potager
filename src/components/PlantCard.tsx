import Link from "next/link";
import { Plant, CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";
import { ActionType } from "@/lib/types";
import { ACTION_COLORS } from "@/lib/calendar";
import PlantAvatar from "./PlantAvatar";

const DIFFICULTY_STYLE: Record<string, string> = {
  facile: "bg-emerald-100 text-emerald-800",
  moyen: "bg-amber-100 text-amber-800",
  difficile: "bg-rose-100 text-rose-800",
};

export default function PlantCard({
  plant,
  badge,
}: {
  plant: Plant;
  badge?: ActionType;
}) {
  return (
    <Link
      href={`/plantes/${plant.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
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
      <h3 className="font-semibold text-emerald-900 group-hover:text-emerald-700">
        {plant.nom}
      </h3>
      <div className="mt-auto flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
          {CATEGORY_LABELS[plant.category]}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 ${DIFFICULTY_STYLE[plant.difficulty]}`}
        >
          {DIFFICULTY_LABELS[plant.difficulty]}
        </span>
      </div>
    </Link>
  );
}
