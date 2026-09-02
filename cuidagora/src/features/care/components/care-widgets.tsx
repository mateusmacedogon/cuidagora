import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Droplets,
  Footprints,
  HeartPulse,
  Pill,
  Pin,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Card, CardTitle } from "@/components/ui/Card";
import { Alert, Badge, EmptyState, ProgressBar } from "@/components/ui/Feedback";
import { archiveTaskAction, addHydrationAction, toggleTaskAction } from "@/features/care/actions";
import type { TodayTask } from "@/features/care/data";
import { describeRule, type CareStatus } from "@/lib/care-status";
import { formatTime } from "@/lib/date";
import { OptimisticTaskRow } from "./OptimisticTaskRow";
import { OptimisticHydration } from "./OptimisticHydration";

/* ------------------------- Semáforo do Cuidado ---------------------------- */

const LEVEL_CONFIG = {
  ok: {
    container: "border-emerald-200 bg-emerald-50/70 text-emerald-950",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: <ShieldCheck className="size-8 text-emerald-600 shrink-0" />,
  },
  attention: {
    container: "border-amber-200 bg-amber-50/70 text-amber-950",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    icon: <AlertTriangle className="size-8 text-amber-600 shrink-0" />,
  },
  urgent: {
    container: "border-rose-200 bg-rose-50/70 text-rose-950",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    icon: <AlertOctagon className="size-8 text-rose-600 shrink-0" />,
  },
} as const;

export function CareTrafficLight({ status }: { status: CareStatus }) {
  const config = LEVEL_CONFIG[status.level];

  return (
    <section
      aria-labelledby="semaforo-titulo"
      className={`rounded-2xl border p-5 sm:p-6 shadow-xs ${config.container}`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.badge}`}
            >
              Semáforo Clínico · {status.word}
            </span>
          </div>
          <h2 id="semaforo-titulo" className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {status.title}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-700 leading-relaxed">{status.description}</p>

          {status.triggered.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {status.triggered.map((rule) => (
                <li
                  key={rule.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs text-slate-900"
                >
                  <div className="flex items-center gap-2 font-bold">
                    {rule.level === "urgent" ? (
                      <span className="flex size-2.5 rounded-full bg-rose-600" />
                    ) : (
                      <span className="flex size-2.5 rounded-full bg-amber-500" />
                    )}
                    <span>{rule.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Condição configurada: {describeRule(rule)} — valor aferido hoje: <strong>{rule.observed}</strong>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-teal-900 bg-teal-50/80 p-2.5 rounded-lg border border-teal-200/80">
                    Conduta combinada: “{rule.instruction}”
                  </p>
                  {rule.source ? (
                    <p className="mt-1 text-xs text-slate-500">Origem da orientação: {rule.source}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {!status.hasGuidelines ? (
            <p className="mt-3 text-xs sm:text-sm font-semibold">
              <a href="/perfil/orientacoes" className="text-teal-700 hover:text-teal-900 hover:underline">
                Cadastrar orientações médicas preventivas →
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Cuidados do dia ---------------------------- */

function getTaskIcon(kind: string) {
  switch (kind) {
    case "medication":
      return <Pill className="size-5 text-teal-700 shrink-0" />;
    case "measurement":
      return <Activity className="size-5 text-blue-700 shrink-0" />;
    case "hydration":
      return <Droplets className="size-5 text-cyan-700 shrink-0" />;
    case "activity":
      return <Footprints className="size-5 text-emerald-700 shrink-0" />;
    default:
      return <Pin className="size-5 text-slate-600 shrink-0" />;
  }
}

export function TaskRow({
  task,
  dateIso,
  allowEdit = true,
  readOnly = false,
}: {
  task: TodayTask;
  dateIso: string;
  allowEdit?: boolean;
  readOnly?: boolean;
}) {
  return (
    <OptimisticTaskRow
      task={task}
      dateIso={dateIso}
      allowEdit={allowEdit}
      readOnly={readOnly}
      icon={getTaskIcon(task.kind)}
    />
  );
}

export function TodayTasksCard({
  tasks,
  dateIso,
  readOnly = false,
  title = "Cuidados do dia",
}: {
  tasks: TodayTask[];
  dateIso: string;
  readOnly?: boolean;
  title?: string;
}) {
  const done = tasks.filter((task) => task.completedAt).length;

  return (
    <Card>
      <CardTitle
        icon={<HeartPulse className="size-5 text-teal-700" />}
        description={`${done} de ${tasks.length} cuidados realizados`}
      >
        {title}
      </CardTitle>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<HeartPulse className="size-8 text-teal-600" />}
          title="Nenhum cuidado cadastrado para hoje"
          description="Cadastre um medicamento ou adicione cuidados como caminhada e hidratação."
          actionLabel="Adicionar novo cuidado"
          actionHref="/cuidados"
        />
      ) : (
        <>
          <div className="mb-4">
            <ProgressBar value={done} max={tasks.length} label="Taxa de adesão do dia" />
          </div>
          <ul className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} dateIso={dateIso} readOnly={readOnly} />
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export function HydrationCard(props: {
  totalMl: number;
  goalMl: number;
  readOnly?: boolean;
}) {
  return <OptimisticHydration {...props} />;
}
