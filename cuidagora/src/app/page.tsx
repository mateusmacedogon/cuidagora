import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Pill,
  ShieldCheck,
  Smile,
  Users,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Alert, SafetyNotice } from "@/components/ui/Feedback";
import { getSessionUser } from "@/lib/auth/session";

const FEATURES = [
  {
    icon: Pill,
    title: "Medicamentos e Horários",
    text: "Cadastre prescrições, dosagens e horários. O CuidAgora organiza sua rotina sem complicações.",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    icon: CheckCircle2,
    title: "Checklist de Cuidados",
    text: "Acompanhe visualmente os cuidados já realizados no dia e o que ainda está pendente.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    icon: Activity,
    title: "Sinais Vitais e Medições",
    text: "Anote leituras de pressão arterial, glicemia e consumo de água com histórico consolidado.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: Smile,
    title: "Check-in Diário de Bem-estar",
    text: "Registre em poucos segundos seu humor, disposição e ocorrência de dores ou sintomas.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    icon: FileText,
    title: "Relatório para a Consulta",
    text: "Gere relatórios impressos ou digitais estruturados para levar ao médico sem esquecer detalhes.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    icon: Users,
    title: "Acompanhamento por Cuidador",
    text: "Compartilhe com familiares ou cuidadores apenas as informações que você autorizar.",
    color: "bg-slate-50 text-slate-700 border-slate-200",
  },
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo principal
        </a>

        {/* Header institucional */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <HeartHandshake className="size-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-teal-800">
                CuidAgora
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800">
                Saúde & Cuidado
              </span>
            </div>
          </Link>
          <nav aria-label="Acesso" className="flex items-center gap-2.5">
            <ButtonLink href="/entrar" variant="secondary" size="sm">
              Acessar conta
            </ButtonLink>
            <ButtonLink href="/criar-conta" size="sm">
              Criar conta gratuita
            </ButtonLink>
          </nav>
        </header>

        <main id="conteudo" tabIndex={-1} className="mt-8 sm:mt-12 flex flex-col gap-12">
          {conta === "excluida" ? (
            <Alert tone="success" title="Conta excluída com sucesso">
              Sua conta e todos os seus registros foram permanentemente apagados do sistema.
            </Alert>
          ) : null}

          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-12 shadow-sm">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800">
                <ShieldCheck className="size-4 text-teal-600" />
                Gestão Humanizada, Acessível e Segura
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Seus cuidados de saúde organizados em um só lugar.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                O CuidAgora ajuda você e sua família a organizar medicamentos, acompanhar pressão e
                glicemia, registrar sintomas e chegar preparado às consultas médicas. Interface clara,
                com acessibilidade nativa e total autonomia para o paciente.
              </p>
              <div className="pt-2 flex flex-wrap gap-3.5">
                <ButtonLink href="/criar-conta" size="lg" icon={<ArrowRight className="size-5" />}>
                  Começar agora
                </ButtonLink>
                <ButtonLink href="/entrar" size="lg" variant="secondary">
                  Acessar demonstração
                </ButtonLink>
              </div>
            </div>
          </section>

          {/* Recursos Principais */}
          <section aria-labelledby="recursos" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 id="recursos" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Recursos do CuidAgora
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Ferramentas desenvolvidas para simplificar sua rotina de saúde diária.
                </p>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.title}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-150 hover:border-teal-300 hover:shadow-md"
                  >
                    <div>
                      <div
                        className={`flex size-12 items-center justify-center rounded-xl border ${feature.color} mb-4`}
                      >
                        <Icon className="size-6 shrink-0" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <SafetyNotice />

          {/* Rodapé institucional */}
          <footer className="border-t border-slate-200/80 pt-6 pb-10 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
            <p>© {new Date().getFullYear()} CuidAgora — Plataforma de cuidados de saúde. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/entrar" className="font-semibold text-teal-700 hover:underline">
                Acessar conta
              </Link>
              <Link href="/criar-conta" className="font-semibold text-teal-700 hover:underline">
                Cadastrar
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
