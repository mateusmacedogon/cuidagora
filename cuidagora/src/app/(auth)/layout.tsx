import Link from "next/link";
import type { ReactNode } from "react";

import { SafetyNotice } from "@/components/ui/Feedback";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-4 py-10">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-2xl font-extrabold text-[var(--color-brand-strong)]"
      >
        <span aria-hidden="true">💚</span>
        CuidAgora
      </Link>
      <main id="conteudo" tabIndex={-1} className="card p-6 shadow-sm sm:p-8">
        {children}
      </main>
      <SafetyNotice compact />
    </div>
  );
}
