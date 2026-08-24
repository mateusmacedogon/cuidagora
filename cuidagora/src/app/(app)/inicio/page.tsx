import type { Metadata } from "next";
import Link from "next/link";

import { SpeakButton } from "@/components/a11y/SpeakButton";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Alert, Badge } from "@/components/ui/Feedback";
import {
  CareTrafficLight,
  HydrationCard,
  TodayTasksCard,
} from "@/features/care/components/care-widgets";
import {
  buildCareMetrics,
  getCheckin,
  getHydrationTotal,
  getNextAppointment,
  listGuidelines,
  listTasksForDate,
} from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { evaluateCareStatus } from "@/lib/care-status";
import { firstNameOf, formatDateTime, formatLongDate, greeting, todayIso } from "@/lib/date";
import { MOOD_LABELS, type MoodValue } from "@/lib/domain";

export const metadata: Metadata = { title: "Início — CuidAgora" };

export default async function DashboardPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const simplified = user.preferences.simplifiedMode;

  const [tasks, hydration, nextAppointment, guidelines, metrics, checkin] = await Promise.all([
    listTasksForDate(user.id, dateIso),
    getHydrationTotal(user.id, dateIso),
    getNextAppointment(user.id),
    listGuidelines(user.id, true),
    buildCareMetrics(user.id, dateIso, user.preferences.hydrationGoalMl),
    getCheckin(user.id, dateIso),
  ]);

  const status = evaluateCareStatus(guidelines, metrics);
  const done = tasks.filter((task) => task.completedAt);
  const pending = tasks.filter((task) => !task.completedAt);
  const nextTask = pending[0];

  const spokenSummary = [
    `${greeting()}, ${firstNameOf(user.name)}.`,
    `Hoje você concluiu ${done.length} de ${tasks.length} cuidados.`,
    nextTask ? `O próximo é ${nextTask.title} às ${nextTask.timeOfDay}.` : "Não há cuidados pendentes.",
    `Você bebeu ${hydration} mililitros de água de uma meta de ${user.preferences.hydrationGoalMl}.`,
    nextAppointment
      ? `Sua próxima consulta é ${nextAppointment.specialty} em ${formatDateTime(nextAppointment.scheduledAt)}.`
      : "Nenhuma consulta marcada.",
    `Semáforo do cuidado: sinal ${status.word}. ${status.title}.`,
  ].join(" ");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[var(--color-ink-soft)]">{formatLongDate(dateIso)}</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
          {greeting()}, {firstNameOf(user.name)}! <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-lg text-[var(--color-ink-soft)]">
          {pending.length === 0
            ? "Você já concluiu todos os cuidados de hoje. Parabéns!"
            : `Você tem ${pending.length} ${pending.length === 1 ? "cuidado" : "cuidados"} para hoje.`}
        </p>
        {user.preferences.readAloud ? (
          <div className="mt-3">
            <SpeakButton text={spokenSummary} label="Ouvir o resumo de hoje" />
          </div>
        ) : null}
      </header>

      <CareTrafficLight status={status} />

      {!checkin ? (
        <Card className="border-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)]">
          <CardTitle icon="😊" description="Leva menos de um minuto.">
            Como você está se sentindo hoje?
          </CardTitle>
          <ButtonLink href="/cuidados/check-in" size="lg" icon="✍️">
            Fazer meu check-in
          </ButtonLink>
        </Card>
      ) : (
        <Alert tone="success" title="Check-in de hoje registrado">
          Você marcou: {MOOD_LABELS[checkin.mood as MoodValue]}.{" "}
          <Link href="/cuidados/check-in" className="font-semibold underline">
            Alterar
          </Link>
        </Alert>
      )}

      <section aria-labelledby="resumo-dia">
        <h2 id="resumo-dia" className="mb-3 text-2xl font-bold">
          Resumo do dia
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <li className="card p-5">
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
              <span aria-hidden="true">✅ </span>Cuidados concluídos
            </p>
            <p className="mt-1 text-3xl font-extrabold">
              {done.length}
              <span className="text-lg font-normal text-[var(--color-ink-soft)]"> de {tasks.length}</span>
            </p>
          </li>
          <li className="card p-5">
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
              <span aria-hidden="true">⏳ </span>Cuidados pendentes
            </p>
            <p className="mt-1 text-3xl font-extrabold">{pending.length}</p>
          </li>
          <li className="card p-5">
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
              <span aria-hidden="true">💊 </span>Próximo cuidado
            </p>
            {nextTask ? (
              <p className="mt-1 text-lg font-bold">
                {nextTask.timeOfDay} — {nextTask.title}
              </p>
            ) : (
              <p className="mt-1 text-lg">Nada pendente por agora.</p>
            )}
          </li>
          <li className="card p-5">
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
              <span aria-hidden="true">💧 </span>Hidratação
            </p>
            <p className="mt-1 text-3xl font-extrabold">
              {hydration}
              <span className="text-lg font-normal text-[var(--color-ink-soft)]">
                {" "}
                / {user.preferences.hydrationGoalMl} ml
              </span>
            </p>
          </li>
          <li className="card p-5 sm:col-span-2 xl:col-span-1">
            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
              <span aria-hidden="true">📅 </span>Próxima consulta
            </p>
            {nextAppointment ? (
              <>
                <p className="mt-1 text-lg font-bold">{nextAppointment.specialty}</p>
                <p className="text-[var(--color-ink-soft)]">
                  {formatDateTime(nextAppointment.scheduledAt)}
                  {nextAppointment.professional ? ` · ${nextAppointment.professional}` : ""}
                </p>
                <p className="mt-2">
                  <Link href="/consultas" className="font-semibold underline">
                    Ver consultas
                  </Link>
                </p>
              </>
            ) : (
              <p className="mt-1">
                Nenhuma consulta marcada.{" "}
                <Link href="/consultas" className="font-semibold underline">
                  Cadastrar
                </Link>
              </p>
            )}
          </li>
        </ul>
      </section>

      <TodayTasksCard tasks={tasks} dateIso={dateIso} />

      <HydrationCard totalMl={hydration} goalMl={user.preferences.hydrationGoalMl} />

      {simplified ? null : (
        <Card>
          <CardTitle icon="⚡" description="Registre em poucos toques.">
            Atalhos rápidos
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/cuidados/medicoes" variant="secondary" icon="🩺">
              Registrar pressão ou glicemia
            </ButtonLink>
            <ButtonLink href="/cuidados/sintomas" variant="secondary" icon="📝">
              Anotar um sintoma
            </ButtonLink>
            <ButtonLink href="/cuidados/medicamentos" variant="secondary" icon="💊">
              Meus medicamentos
            </ButtonLink>
            <ButtonLink href="/resumo" variant="secondary" icon="📄">
              Gerar resumo para consulta
            </ButtonLink>
          </div>
          <p className="mt-4">
            <Badge tone="info" icon="🧩">
              Dica: ative o modo simplificado no botão “Acessibilidade”.
            </Badge>
          </p>
        </Card>
      )}
    </div>
  );
}
