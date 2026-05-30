import type { Plant } from "@/lib/types";
import { buyLinks } from "@/lib/shopping";

export default function BuyLinksSection({ plant }: { plant: Plant }) {
  const links = buyLinks(plant);
  return (
    <section className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 font-bold text-emerald-800 dark:text-emerald-100">
        🛒 Où acheter les {plant.category === "fruit" ? "plants" : "graines"}
      </h3>
      <p className="mb-3 text-sm text-emerald-800/80 dark:text-emerald-100/80">
        Comparez les prix pour trouver le moins cher.
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              l.compare
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
            }`}
          >
            {l.compare ? "💶 " : ""}
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
