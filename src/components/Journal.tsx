"use client";

import { useMemo, useState } from "react";
import {
  useJournal,
  JournalType,
  JOURNAL_TYPE_LABELS,
  JOURNAL_TYPE_EMOJI,
} from "@/lib/journal";
import { PLANTS, getPlantById } from "@/lib/plants";

const TYPES = Object.keys(JOURNAL_TYPE_LABELS) as JournalType[];

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}

function formatDate(iso: string): string {
  const [y, m, j] = iso.split("-").map(Number);
  if (!y || !m || !j) return iso;
  return new Date(y, m - 1, j).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Journal() {
  const { entries, ready, add, remove } = useJournal();

  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<JournalType>("recolte");
  const [plantId, setPlantId] = useState("");
  const [titre, setTitre] = useState("");
  const [note, setNote] = useState("");
  const [quantite, setQuantite] = useState("");
  const [unite, setUnite] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()];
  }, [entries]);

  const submit = () => {
    add({
      date: date || todayISO(),
      type,
      plantId,
      titre: titre.trim(),
      note: note.trim(),
      quantite: quantite ? Number(quantite) : null,
      unite: unite.trim(),
    });
    setTitre("");
    setNote("");
    setQuantite("");
    setUnite("");
  };

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout */}
      <div className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              Type
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as JournalType)}
              className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOURNAL_TYPE_EMOJI[t]} {JOURNAL_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              Plante (optionnel)
            </span>
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
            >
              <option value="">—</option>
              {PLANTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              Titre
            </span>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="ex: première récolte"
              className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
            />
          </label>
          <div className="flex gap-2">
            <label className="block flex-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-300">
                Quantité
              </span>
              <input
                type="number"
                step="any"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
              />
            </label>
            <label className="block flex-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-300">
                Unité
              </span>
              <input
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                placeholder="kg, pièces…"
                className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
              />
            </label>
          </div>
          <label className="block sm:col-span-2">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">
              Note
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
            />
          </label>
        </div>
        <div className="mt-3">
          <button
            onClick={submit}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Ajouter au journal
          </button>
        </div>
      </div>

      {/* Liste des entrées */}
      {!ready ? (
        <p className="text-sm text-emerald-700/60 dark:text-emerald-300/60">
          Chargement…
        </p>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-4xl">📖</p>
          <p className="mt-3 font-semibold text-emerald-900 dark:text-emerald-50">
            Journal vide
          </p>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            Notez vos récoltes, semis et observations pour suivre votre saison.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, list]) => (
            <div key={day}>
              <h2 className="mb-2 text-sm font-semibold capitalize text-emerald-900 dark:text-emerald-50">
                {formatDate(day)}
              </h2>
              <ul className="space-y-2">
                {list.map((e) => {
                  const plant = e.plantId ? getPlantById(e.plantId) : null;
                  return (
                    <li
                      key={e.id}
                      className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <span className="text-xl">
                        {JOURNAL_TYPE_EMOJI[e.type]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-50">
                          {JOURNAL_TYPE_LABELS[e.type]}
                          {plant && (
                            <span className="font-normal text-emerald-700 dark:text-emerald-300">
                              {" "}
                              · {plant.emoji} {plant.nom}
                            </span>
                          )}
                          {e.titre && (
                            <span className="font-normal text-emerald-800 dark:text-emerald-100">
                              {" "}
                              — {e.titre}
                            </span>
                          )}
                        </p>
                        {(e.quantite !== null || e.note) && (
                          <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-100/80">
                            {e.quantite !== null && (
                              <span className="font-medium">
                                {e.quantite}
                                {e.unite ? ` ${e.unite}` : ""}
                              </span>
                            )}
                            {e.quantite !== null && e.note ? " · " : ""}
                            {e.note}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(e.id)}
                        className="rounded-full px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
                      >
                        Retirer
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
