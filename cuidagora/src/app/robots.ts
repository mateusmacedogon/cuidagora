import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cuidagora.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/entrar", "/criar-conta", "/recuperar-senha"],
        disallow: ["/api/", "/inicio", "/cuidados", "/acompanhando", "/consultas", "/resumo", "/perfil"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
