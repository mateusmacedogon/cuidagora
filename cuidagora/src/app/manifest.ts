import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CuidAgora — Gestão de Cuidados de Saúde",
    short_name: "CuidAgora",
    description:
      "Plataforma humanizada e acessível para organização de rotinas de saúde, medicamentos, sintomas e sinais vitais.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
