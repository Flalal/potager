"use client";

import { useClimate, ZONE_LABELS, Zone } from "@/lib/climate";

const ZONES: Zone[] = ["nord", "tempere", "sud"];

export default function ZoneSelect() {
  const { zone, setZone } = useClimate();

  return (
    <label className="flex items-center gap-1.5 text-xs text-emerald-800">
      <span className="hidden sm:inline">📍 Région</span>
      <select
        value={zone}
        onChange={(e) => setZone(e.target.value as Zone)}
        className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs font-medium text-emerald-800 outline-none focus:border-emerald-400"
      >
        {ZONES.map((z) => (
          <option key={z} value={z}>
            {ZONE_LABELS[z]}
          </option>
        ))}
      </select>
    </label>
  );
}
