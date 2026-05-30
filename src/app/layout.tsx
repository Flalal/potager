import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { ClimateProvider } from "@/lib/climate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mon Potager — Calendrier de jardinage",
  description:
    "Quand semer, planter et récolter vos légumes, fruits et aromates. Un guide simple pour débuter au potager.",
  appleWebApp: { capable: true, title: "Potager", statusBarStyle: "default" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1410" },
  ],
};

// Pose la classe `.dark` avant le premier paint (évite le flash de thème).
const NO_FLASH = `(function(){try{var t=localStorage.getItem('mon-potager:theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ClimateProvider>
          <ServiceWorkerRegister />
          <Nav />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-emerald-100 py-4 text-center text-xs text-emerald-700/70 dark:border-zinc-800 dark:text-emerald-300/70">
            Dates indicatives, ajustées à votre région — à affiner selon la météo locale.
          </footer>
        </ClimateProvider>
      </body>
    </html>
  );
}
