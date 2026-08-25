import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Smile,
} from "lucide-react";

import { PageHeader, Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { HydrationCard, TodayTasksCard } from "@/features/care/components/care-widgets";
import { CareTaskForm } from "@/features/care/components/medication-forms";
import { getHydrationTotal, listTasksForDate } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { todayIso } from "@/lib/date";

export const metadata: Metadata = { title: "Gestão de Cuidados — CuidAgora" };

const AREAS = [
  {
    href: "/cuidados/medicamentos",
    icon: Pill,
    title: "Medicamentos e Posologia",
    text: "Cadastre medicamentos contínuos, dosagens e horários programados.",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    href: "/cuidados/medicoes",
    icon: Activity,
    title: "Medições e Sinais Vitais",
    text: "Monitore pressão arterial sistólica/diastólica e glicemia capilar.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    href: "/cuidados/check-in",
    icon: Smile,
    title: "Check-in Diário de Bem-estar",
    text: "Avaliação diária de humor, sintomas de dor e disposição geral.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    href: "/cuidados/sintomas",
    icon: FileText,
    title: "Registro de Sintomas",
    text: "Anote ocorrências e intensidade com suporte a transcrição por voz.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export default async function CarePage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const [tasks, hydration] = await Promise.all([
    listTasksForDate(user.id, dateIso),
    getHydrationTotal(user.id, dateIso),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<HeartPulse className="size-7" />}
        title="Plano de Cuidados Diários"
        description="Acompanhamento consolidado de horários, medicações e sinais vitais."
      />

      <TodayTasksCard tasks={tasks} dateIso={dateIso} />

      <section aria-labelledby="areas-cuidado" className="space-y-3">
        <h2 id="areas-cuidado" className="text-lg sm:text-xl font-bold text-slate-900">
          Módulos de Registro
        </h2>
        <ul className="grid gap-3.5 sm:grid-cols-2">
          {AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <li
                key={area.href}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-teal-300 hover:shadow-sm"
              >
                <div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl border ${area.color} mb-3.5`}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                    {area.title}
                  </h3>
                  <p className="mt-1 mb-4 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {area.text}
                  </p>
                </div>
                <ButtonLink href={area.href} variant="outline" size="sm" icon={<ArrowRight className="size-4" />}>
                  Acessar módulo
                </ButtonLink>
              </li>
            );
          })}
        </ul>
      </section>

      <HydrationCard totalMl={hydration} goalMl={user.preferences.hydrationGoalMl} />

      <Card>
        <CardTitle
          icon={<Plus className="size-5 text-teal-700" />}
          description="Adicione atividades como caminhada, repouso ou medições personalizadas."
        >
          Adicionar cuidado avulso à rotina
        </CardTitle>
        <CareTaskForm />
      </Card>
    </div>
  );
}
