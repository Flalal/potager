"use client";

export default function PrintButton({ label = "Imprimer" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
    >
      🖨️ {label}
    </button>
  );
}
