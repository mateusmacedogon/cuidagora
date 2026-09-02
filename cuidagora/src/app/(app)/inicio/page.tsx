import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  HeartPulse,
  Pill,
  Smile,
  Sparkles,
  Zap,
} from "lucide-react";

import { SpeakButton } from "@/components/a11y/SpeakButton";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Alert, Badge } from "@/components/ui/Feedback";
import {
  CareTrafficLight,
  HydrationCard,
  TodayTasksCard,
} from "@/features/care/components/care-widgets";
import { EmergencyCard } from "@/features/care/components/EmergencyCard";
import { QuickLogHub } from "@/features/care/components/QuickLogHub";
import {
  buildCareMetrics,
  getCheckin,
  getHydrationTotal,
  getNextAppointment,
  listGuidelines,
  listTasksForDate,
} from "@/features/care/data";
import { listMyCaregivers } from "@/features/caregiver/data";
import { requireUser } from "@/lib/auth/session";
import { evaluateCareStatus } from "@/lib/care-status";
import { firstNameOf, formatDateTime, formatLongDate, greeting, todayIso } from "@/lib/date";
import { MOOD_LABELS, type MoodValue } from "@/lib/domain";

export const metadata: Metadata = { title: "Painel Principal — CuidAgora" };

export default async function DashboardPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const simplified = user.preferences.simplifiedMode;

  const [tasks, hydration, nextAppointment, guidelines, checkin, caregivers] =
    await Promise.all([
      listTasksForDate(user.id, dateIso),
      getHydrationTotal(user.id, dateIso),
      getNextAppointment(user.id),
      listGuidelines(user.id, true),
      getCheckin(user.id, dateIso),
      listMyCaregivers(user.id),
    ]);

  const metrics = await buildCareMetrics(user.id, dateIso, user.preferences.hydrationGoalMl, {
    tasks,
    hydration,
  });

  const primaryCaregiver = caregivers[0];
  const status = evaluateCareStatus(guidelines, metrics);
  const done = tasks.filter((task) => task.completedAt);
  const pending = tasks.filter((task) => !task.completedAt);
  const nextTask = pending[0];

  const spokenSummary = [
    `${greeting()}, ${firstNameOf(user.name)}.`,
    `Hoje você concluiu ${done.length} de ${tasks.length} cuidados.`,
    nextTask ? `O próximo é ${nextTask.title} às ${nextTask.timeOfDay}.` : "Não há cuidados pendentes no momento.",
    `Você registrou ${hydration} mililitros de água de uma meta de ${user.preferences.hydrationGoalMl}.`,
    nextAppointment
      ? `Sua próxima consulta é ${nextAppointment.specialty} em ${formatDateTime(nextAppointment.scheduledAt)}.`
      : "Nenhuma consulta médica pendente.",
    `Semáforo do cuidado: ${status.word}. ${status.title}.`,
  ].join(" ");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
            {formatLongDate(dateIso)}
          </p>
          <h1 className="mt-1 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {greeting()}, {firstNameOf(user.name)}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            {pending.length === 0
              ? "Você concluiu todos os cuidados programados para hoje. Excelente adesão!"
              : `Você possui ${pending.length} ${pending.length === 1 ? "cuidado pendente" : "cuidados pendentes"} para hoje.`}
          </p>
        </div>
        {user.preferences.readAloud ? (
          <div className="shrink-0">
            <SpeakButton text={spokenSummary} label="Ouvir resumo do dia" />
          </div>
        ) : null}
      </header>

      {/* Cartão de Emergência Rápida SOS */}
      <EmergencyCard
        caregiverName={primaryCaregiver?.caregiverName}
        caregiverEmail={primaryCaregiver?.caregiverEmail}
      />

      {/* Semáforo Clínico */}
      <CareTrafficLight status={status} />

      {/* Hub de Registro Rápido */}
      <QuickLogHub />

      {!checkin ? (
        <Card className="border border-indigo-200 bg-indigo-50/60 shadow-xs">
          <CardTitle
            icon={<Smile className="size-5 text-indigo-700" />}
            description="Registro rápido do seu bem-estar em menos de 1 minuto."
          >
            Como você está se sentindo hoje?
          </CardTitle>
          <div className="mt-2">
            <ButtonLink href="/cuidados/check-in" size="md" icon={<Smile className="size-4" />}>
              Fazer meu check-in de hoje
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <Alert tone="success" title="Check-in diário registrado">
          Estado geral informado: <strong>{MOOD_LABELS[checkin.mood as MoodValue]}</strong>.{" "}
          <Link href="/cuidados/check-in" className="font-bold text-teal-800 underline hover:text-teal-950 ml-1">
            Revisar check-in
          </Link>
        </Alert>
      )}

      <section aria-labelledby="resumo-dia" className="space-y-3">
        <h2 id="resumo-dia" className="text-lg sm:text-xl font-bold text-slate-900">
          Resumo e Indicadores do Dia
        </h2>
        <ul className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          <li className="card p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cuidados Concluídos</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {done.length}
              <span className="text-sm font-normal text-slate-500 ml-1">/ {tasks.length} total</span>
            </p>
          </li>

          <li className="card p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cuidados Pendentes</span>
              <Clock className="size-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {pending.length}
            </p>
          </li>

          <li className="card p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Próximo Cuidado</span>
              <Pill className="size-4 text-teal-600" />
            </div>
            {nextTask ? (
              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 rounded bg-teal-100/80 text-teal-900 text-xs font-bold tabular-nums mb-1">
                  {nextTask.timeOfDay}
                </span>
                <p className="text-sm font-bold text-slate-900 truncate">{nextTask.title}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Tudo concluído por enquanto.</p>
            )}
          </li>

          <li className="card p-4.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Consumo de Água</span>
              <Droplets className="size-4 text-cyan-600" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {hydration}
              <span className="text-sm font-normal text-slate-500 ml-1">
                / {user.preferences.hydrationGoalMl} ml
              </span>
            </p>
          </li>

          <li className="card p-4.5 flex flex-col justify-between sm:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Próximo Agendamento</span>
              <Calendar className="size-4 text-indigo-600" />
            </div>
            {nextAppointment ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-slate-900">{nextAppointment.specialty}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(nextAppointment.scheduledAt)}
                    {nextAppointment.professional ? ` · ${nextAppointment.professional}` : ""}
                  </p>
                </div>
                <Link
                  href="/consultas"
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Ver agenda →
                </Link>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs sm:text-sm text-slate-500">Nenhuma consulta cadastrada no momento.</p>
                <Link
                  href="/consultas"
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Agendar consulta
                </Link>
              </div>
            )}
          </li>
        </ul>
      </section>

      <TodayTasksCard tasks={tasks} dateIso={dateIso} />

      <HydrationCard totalMl={hydration} goalMl={user.preferences.hydrationGoalMl} />

      {simplified ? null : (
        <Card>
          <CardTitle
            icon={<Zap className="size-5 text-amber-600" />}
            description="Acesso direto aos formulários de registro."
          >
            Ações Rápidas
          </CardTitle>
          <div className="flex flex-wrap gap-2.5">
            <ButtonLink href="/cuidados/medicoes" variant="outline" size="sm" icon={<Activity className="size-4" />}>
              Registrar medições
            </ButtonLink>
            <ButtonLink href="/cuidados/sintomas" variant="outline" size="sm" icon={<FileText className="size-4" />}>
              Anotar sintoma
            </ButtonLink>
            <ButtonLink href="/cuidados/medicamentos" variant="outline" size="sm" icon={<Pill className="size-4" />}>
              Gerenciar medicamentos
            </ButtonLink>
            <ButtonLink href="/resumo" variant="outline" size="sm" icon={<FileText className="size-4" />}>
              Relatório para consulta
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}
