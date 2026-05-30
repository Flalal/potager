"use client";

import { useState } from "react";
import { useGarden } from "@/lib/garden";

export default function AddToGarden({
  plantId,
  plantNom,
}: {
  plantId: string;
  plantNom: string;
}) {
  const { add } = useGarden();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantite, setQuantite] = useState(1);
  const [emplacement, setEmplacement] = useState("");

  const handleAdd = () => {
    add({
      plantId,
      datePlantation: date,
      quantite,
      emplacement,
      notes: "",
    });
    setOpen(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        {done ? "✓ Ajouté !" : "🪴 Ajouter à mon jardin"}
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 sm:w-72">
      <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-50">
        Planter « {plantNom} »
      </p>
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-xs text-emerald-700 dark:text-emerald-300">Date de plantation</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 dark:border-zinc-700 px-2 py-1.5 outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
          />
        </label>
        <div className="flex gap-3">
          <label className="block w-20">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">Quantité</span>
            <input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-emerald-200 dark:border-zinc-700 px-2 py-1.5 outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
            />
          </label>
          <label className="block flex-1">
            <span className="text-xs text-emerald-700 dark:text-emerald-300">Emplacement</span>
            <input
              type="text"
              value={emplacement}
              onChange={(e) => setEmplacement(e.target.value)}
              placeholder="ex: balcon"
              className="mt-1 w-full rounded-lg border border-emerald-200 dark:border-zinc-700 px-2 py-1.5 outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
            />
          </label>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAdd}
          className="flex-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Enregistrer
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-zinc-800"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
