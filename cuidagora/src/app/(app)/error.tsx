"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Nunca registramos conteúdo de saúde nos logs — apenas a ocorrência.
    console.error("Falha ao carregar uma página do CuidAgora.");
  }, []);

  return (
    <div className="card p-6 border-amber-200 bg-amber-50/50" role="alert">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="size-6 text-amber-600 shrink-0" />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Algo não carregou como esperado
        </h1>
      </div>
      <p className="mt-2 text-sm sm:text-base text-slate-600">
        Seus dados permanecem seguros e preservados no banco de dados. Tente recarregar a tela.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 min-h-11 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Tentar novamente
        </button>
        <a
          href="/inicio"
          className="inline-flex items-center gap-2 min-h-11 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
        >
          <Home className="size-4 text-slate-500" />
          Ir para o início
        </a>
      </div>
    </div>
  );
}
