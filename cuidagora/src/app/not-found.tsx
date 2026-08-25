import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center items-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
        <Search className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="text-sm text-slate-600 max-w-sm">
        O endereço solicitado pode ter sido movido ou o registro não está mais disponível.
      </p>
      <div className="pt-2">
        <Link
          href="/inicio"
          className="inline-flex items-center gap-2 min-h-11 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-xs"
        >
          <Home className="size-4" />
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
