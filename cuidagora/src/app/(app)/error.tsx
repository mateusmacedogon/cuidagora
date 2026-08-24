"use client";

import { useEffect } from "react";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Nunca registramos conteúdo de saúde nos logs — apenas a ocorrência.
    console.error("Falha ao carregar uma página do CuidAgora.");
  }, []);

  return (
    <div className="card p-6" role="alert">
      <h1 className="text-2xl font-bold">
        <span aria-hidden="true">😕 </span>
        Algo não carregou como esperado
      </h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Seus dados estão salvos. Tente abrir a página de novo.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-12 rounded-full bg-[var(--color-brand)] px-6 py-3 font-semibold text-white"
        >
          🔄 Tentar de novo
        </button>
        <a
          href="/inicio"
          className="min-h-12 rounded-full border-2 border-[var(--color-brand)] px-6 py-3 font-semibold text-[var(--color-brand-strong)]"
        >
          🏠 Ir para o início
        </a>
      </div>
    </div>
  );
}
