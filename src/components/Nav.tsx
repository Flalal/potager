"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ZoneSelect from "./ZoneSelect";

const LINKS = [
  { href: "/", label: "Ce mois-ci", emoji: "📅" },
  { href: "/calendrier", label: "Calendrier", emoji: "🗓️" },
  { href: "/plantes", label: "Plantes", emoji: "🌱" },
  { href: "/potager", label: "Plan", emoji: "🟫" },
  { href: "/mon-jardin", label: "Mon jardin", emoji: "🪴" },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
          <span className="text-2xl">🌻</span>
          <span className="hidden sm:inline">Mon Potager</span>
        </Link>
        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <span>{link.emoji}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <ZoneSelect />
      </div>
    </header>
  );
}
