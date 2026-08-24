import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 text-center">
      <p aria-hidden="true" className="text-5xl">
        🔍
      </p>
      <h1 className="text-2xl font-bold">Não encontramos esta página</h1>
      <p className="text-[var(--color-ink-soft)]">
        O endereço pode ter mudado ou o registro foi removido.
      </p>
      <p>
        <Link
          href="/inicio"
          className="inline-block min-h-12 rounded-full bg-[var(--color-brand)] px-6 py-3 font-semibold text-white"
        >
          🏠 Voltar para o início
        </Link>
      </p>
    </main>
  );
}
