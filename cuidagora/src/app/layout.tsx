import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuidAgora — organize seus cuidados de saúde",
  description:
    "O CuidAgora ajuda você a organizar medicamentos, consultas, medições e cuidados do dia a dia. Não faz diagnósticos e não substitui profissionais de saúde.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-[var(--color-canvas)] text-[var(--color-ink)]">{children}</body>
    </html>
  );
}
