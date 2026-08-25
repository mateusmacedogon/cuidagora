import Link from "next/link";
import type { ReactNode } from "react";
import { HeartHandshake } from "lucide-react";

import { SafetyNotice } from "@/components/ui/Feedback";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col justify-center bg-slate-50/60 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md flex flex-col gap-6">
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight text-teal-800 hover:text-teal-900 transition-colors"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <HeartHandshake className="size-6" aria-hidden="true" />
            </div>
            <span>CuidAgora</span>
          </Link>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            Portal de Gestão de Cuidados de Saúde
          </p>
        </div>
        <main
          id="conteudo"
          tabIndex={-1}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm"
        >
          {children}
        </main>
        <SafetyNotice compact />
      </div>
    </div>
  );
}
