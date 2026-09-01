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
  const done = Boolean(task.completedAt);

  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-3.5 rounded-xl border p-4 transition-all duration-150 ${
        done
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-lg bg-slate-100 py-1 text-xs font-bold text-slate-700 tabular-nums">
          <Clock className="size-3.5 text-slate-500 mb-0.5" />
          {task.timeOfDay}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span aria-hidden="true">{getTaskIcon(task.kind)}</span>
            <p className={`text-base font-bold ${done ? "line-through text-slate-500" : "text-slate-900"}`}>
              {task.title}
            </p>
            <Badge
              tone={done ? "success" : "neutral"}
              icon={done ? <Check className="size-3" /> : <Clock className="size-3" />}
            >
              {done ? "Realizado" : "Pendente"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {task.description || "Cuidado agendado"}
            {done && task.completedAt ? ` · concluído às ${formatTime(task.completedAt)}` : ""}
          </p>
        </div>
      </div>

      {readOnly ? null : (
        <div className="flex items-center gap-2 shrink-0">
          <form action={toggleTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="date" value={dateIso} />
            <input type="hidden" name="done" value={done ? "0" : "1"} />
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 min-h-10 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer ${
                done
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              {done ? (
                <>
                  <RotateCcw className="size-3.5 text-slate-500" />
                  Desfazer
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Marcar feito
                </>
              )}
            </button>
          </form>
          {allowEdit && !done ? (
            <form action={archiveTaskAction}>
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                className="inline-flex items-center justify-center size-10 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                title="Remover este cuidado"
                aria-label="Remover cuidado"
              >
                <Trash2 className="size-4" />
              </button>
            </form>
          ) : null}
        </div>
      )}
    </li>
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

/* -------------------------------- Hidratação ------------------------------ */

const QUICK_AMOUNTS = [200, 300, 500];

export function HydrationCard({
  totalMl,
  goalMl,
  readOnly = false,
}: {
  totalMl: number;
  goalMl: number;
  readOnly?: boolean;
}) {
  const reached = totalMl >= goalMl;
  return (
    <Card>
      <CardTitle
        icon={<Droplets className="size-5 text-cyan-700" />}
        description={`Meta diária programada: ${goalMl} ml`}
      >
        Controle de Hidratação
      </CardTitle>
      <div className="mb-3">
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
          {totalMl}{" "}
          <span className="text-sm sm:text-base font-normal text-slate-500">ml ingeridos hoje</span>
        </p>
      </div>
      <ProgressBar value={totalMl} max={goalMl} label="Progresso da meta" />
      {reached ? (
        <div className="mt-3">
          <Alert tone="success" title="Meta de hidratação atingida">
            Excelente! Você alcançou o volume de água estabelecido para o seu dia.
          </Alert>
        </div>
      ) : null}
      {readOnly ? null : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Adicionar rápido:</span>
          {QUICK_AMOUNTS.map((amount) => (
            <form key={amount} action={addHydrationAction}>
              <input type="hidden" name="amountMl" value={amount} />
              <button
                type="submit"
                className="inline-flex items-center gap-1 min-h-9 rounded-lg border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100/80 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="size-3" /> {amount} ml
              </button>
            </form>
          ))}
        </div>
      )}
    </Card>
  );
}
