import { Card, CardTitle } from "@/components/ui/Card";
import { Alert, Badge, EmptyState, ProgressBar } from "@/components/ui/Feedback";
import { archiveTaskAction, addHydrationAction, toggleTaskAction } from "@/features/care/actions";
import type { TodayTask } from "@/features/care/data";
import { describeRule, type CareStatus } from "@/lib/care-status";
import { formatTime } from "@/lib/date";
import { taskKindMeta } from "@/lib/domain";

/* ------------------------- Semáforo do Cuidado ---------------------------- */

const LEVEL_STYLES = {
  ok: "border-[var(--color-good)] bg-[var(--color-good-soft)]",
  attention: "border-[var(--color-warn)] bg-[var(--color-warn-soft)]",
  urgent: "border-[var(--color-alert)] bg-[var(--color-alert-soft)]",
} as const;

export function CareTrafficLight({ status }: { status: CareStatus }) {
  return (
    <section
      aria-labelledby="semaforo-titulo"
      className={`rounded-[var(--radius-card)] border-4 p-5 sm:p-6 ${LEVEL_STYLES[status.level]}`}
    >
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="text-4xl leading-none">
          {status.icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wide">
            Semáforo do Cuidado · Sinal {status.word}
          </p>
          <h2 id="semaforo-titulo" className="mt-1 text-xl font-extrabold sm:text-2xl">
            {status.title}
          </h2>
          <p className="mt-2 text-[var(--color-ink)]">{status.description}</p>

          {status.triggered.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {status.triggered.map((rule) => (
                <li key={rule.id} className="rounded-2xl border-2 border-[var(--color-line)] bg-white p-4">
                  <p className="font-bold">
                    <span aria-hidden="true">{rule.level === "urgent" ? "🔴 " : "🟡 "}</span>
                    {rule.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                    Regra cadastrada: {describeRule(rule)} — valor registrado hoje: {rule.observed}
                  </p>
                  <p className="mt-2 font-medium">Orientação cadastrada: “{rule.instruction}”</p>
                  {rule.source ? (
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Cadastrada por: {rule.source}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {!status.hasGuidelines ? (
            <p className="mt-3 text-sm font-semibold">
              <a href="/perfil/orientacoes" className="underline">
                Cadastrar as orientações do meu profissional de saúde
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Cuidados do dia ---------------------------- */

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
  const meta = taskKindMeta(task.kind);
  const done = Boolean(task.completedAt);

  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-2xl border-2 p-4 ${
        done
          ? "border-[var(--color-good)] bg-[var(--color-good-soft)]"
          : "border-[var(--color-line)] bg-[var(--color-surface)]"
      }`}
    >
      <span className="w-16 shrink-0 text-lg font-extrabold tabular-nums">{task.timeOfDay}</span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-lg font-bold">
          <span aria-hidden="true">{meta.icon}</span>
          <span className={done ? "line-through decoration-2" : ""}>{task.title}</span>
          <Badge tone={done ? "success" : "neutral"} icon={done ? "✔️" : "⏳"}>
            {done ? "Concluído" : "Pendente"}
          </Badge>
        </p>
        <p className="text-sm text-[var(--color-ink-soft)]">
          {meta.label}
          {task.description ? ` · ${task.description}` : ""}
          {done && task.completedAt ? ` · marcado às ${formatTime(task.completedAt)}` : ""}
        </p>
      </div>

      {readOnly ? null : (
        <div className="flex flex-wrap gap-2">
          <form action={toggleTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="date" value={dateIso} />
            <input type="hidden" name="done" value={done ? "0" : "1"} />
            <button
              type="submit"
              className={`min-h-12 rounded-full px-5 py-2 font-semibold ${
                done
                  ? "border-2 border-[var(--color-line)] bg-white text-[var(--color-ink)]"
                  : "bg-[var(--color-brand)] text-white"
              }`}
            >
              {done ? "↩️ Desfazer" : "✔️ Marcar como feito"}
            </button>
          </form>
          {allowEdit && !done ? (
            <form action={archiveTaskAction}>
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                className="min-h-12 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold"
              >
                🗑️ Remover
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
  title = "Cuidados de hoje",
}: {
  tasks: TodayTask[];
  dateIso: string;
  readOnly?: boolean;
  title?: string;
}) {
  const done = tasks.filter((task) => task.completedAt).length;

  return (
    <Card>
      <CardTitle icon="💚" description={`${done} de ${tasks.length} cuidados concluídos`}>
        {title}
      </CardTitle>

      {tasks.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Você ainda não tem cuidados cadastrados"
          description="Cadastre um medicamento ou crie um cuidado simples, como beber água ou caminhar."
          actionLabel="Adicionar meu primeiro cuidado"
          actionHref="/cuidados"
        />
      ) : (
        <>
          <div className="mb-4">
            <ProgressBar value={done} max={tasks.length} label="Progresso do dia" />
          </div>
          <ul className="flex flex-col gap-3">
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
      <CardTitle icon="💧" description={`Meta do dia: ${goalMl} ml`}>
        Hidratação
      </CardTitle>
      <p className="mb-3 text-2xl font-extrabold">
        {totalMl} ml <span className="text-base font-normal text-[var(--color-ink-soft)]">registrados hoje</span>
      </p>
      <ProgressBar value={totalMl} max={goalMl} label="Água de hoje" />
      {reached ? (
        <div className="mt-3">
          <Alert tone="success" title="Meta atingida">
            Você já registrou a quantidade de água que combinou consigo.
          </Alert>
        </div>
      ) : null}
      {readOnly ? null : (
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <form key={amount} action={addHydrationAction}>
              <input type="hidden" name="amountMl" value={amount} />
              <button
                type="submit"
                className="min-h-12 rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-brand-soft)] px-5 py-2 font-semibold text-[var(--color-brand-strong)]"
              >
                + {amount} ml
              </button>
            </form>
          ))}
        </div>
      )}
    </Card>
  );
}
