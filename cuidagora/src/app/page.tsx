import Link from "next/link";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { Alert, SafetyNotice } from "@/components/ui/Feedback";
import { getSessionUser } from "@/lib/auth/session";

const FEATURES = [
  { icon: "💊", title: "Medicamentos e horários", text: "Cadastre o que você toma e em que horas. O CuidAgora lembra você da rotina." },
  { icon: "✅", title: "Cuidados do dia", text: "Uma lista simples com o que já foi feito e o que ainda falta." },
  { icon: "🩺", title: "Pressão, glicemia e água", text: "Anote suas medições em poucos toques e veja o histórico." },
  { icon: "😊", title: "Check-in diário", text: "Conte como você está em menos de um minuto." },
  { icon: "📄", title: "Resumo para a consulta", text: "Leve tudo organizado e impresso para o seu profissional de saúde." },
  { icon: "👨‍👩‍👧", title: "Modo cuidador", text: "Compartilhe só o que você quiser com quem te acompanha." },
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ conta?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/inicio");
  const { conta } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-2xl font-extrabold text-[var(--color-brand-strong)]">
          <span aria-hidden="true">💚</span> CuidAgora
        </p>
        <nav aria-label="Acesso" className="flex gap-2">
          <ButtonLink href="/entrar" variant="secondary">
            Entrar
          </ButtonLink>
          <ButtonLink href="/criar-conta">Criar conta</ButtonLink>
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1} className="mt-10 flex flex-col gap-10">
        {conta === "excluida" ? (
          <Alert tone="success" title="Conta excluída">
            Sua conta e todos os seus registros foram apagados do CuidAgora.
          </Alert>
        ) : null}

        <section className="card p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Seus cuidados de saúde, organizados em um lugar só.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-ink-soft)]">
            O CuidAgora ajuda você — ou quem você cuida — a lembrar dos medicamentos, anotar sintomas,
            registrar pressão e glicemia, e chegar preparado na consulta. Simples, com letras grandes e
            sem complicação.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/criar-conta" size="lg" icon="✨">
              Começar agora
            </ButtonLink>
            <ButtonLink href="/entrar" size="lg" variant="secondary" icon="👀">
              Ver a demonstração
            </ButtonLink>
          </div>
        </section>

        <section aria-labelledby="recursos">
          <h2 id="recursos" className="mb-4 text-2xl font-bold">
            O que dá para fazer
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="card p-5">
                <p aria-hidden="true" className="text-3xl">
                  {feature.icon}
                </p>
                <h3 className="mt-2 text-lg font-bold">{feature.title}</h3>
                <p className="mt-1 text-[var(--color-ink-soft)]">{feature.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <SafetyNotice />

        <footer className="border-t border-[var(--color-line)] pt-6 text-sm text-[var(--color-ink-soft)]">
          <p>
            CuidAgora — projeto demonstrativo com dados fictícios.{" "}
            <Link href="/entrar" className="font-semibold underline">
              Entrar
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
