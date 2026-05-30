import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mon Potager",
    short_name: "Potager",
    description:
      "Calendrier de jardinage pour débutants : quoi semer, planter et récolter, et où.",
    start_url: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#16a34a",
    lang: "fr",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
