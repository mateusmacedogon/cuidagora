"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { Check, Clock, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Feedback";
import { archiveTaskAction, toggleTaskAction } from "@/features/care/actions";
import type { TodayTask } from "@/features/care/data";
import { formatTime } from "@/lib/date";

export function OptimisticTaskRow({
  task,
  dateIso,
  allowEdit = true,
  readOnly = false,
  icon,
}: {
  task: TodayTask;
  dateIso: string;
  allowEdit?: boolean;
  readOnly?: boolean;
  icon?: ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    Boolean(task.completedAt),
    (_state, nextVal: boolean) => nextVal,
  );

  const done = optimisticCompleted;

  const handleToggle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextDone = !done;
    startTransition(async () => {
      setOptimisticCompleted(nextDone);
      const fd = new FormData();
      fd.set("taskId", task.id);
      fd.set("date", dateIso);
      fd.set("done", nextDone ? "1" : "0");
      await toggleTaskAction(fd);
    });
  };

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
            {icon ? <span aria-hidden="true">{icon}</span> : null}
            <p
              className={`text-base font-bold transition-colors ${
                done ? "line-through text-slate-500" : "text-slate-900"
              }`}
            >
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
            {done && task.completedAt ? ` · concluído às ${formatTime(new Date(task.completedAt))}` : ""}
          </p>
        </div>
      </div>

      {readOnly ? null : (
        <div className="flex items-center gap-2 shrink-0">
          <form onSubmit={handleToggle} action={toggleTaskAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="date" value={dateIso} />
            <input type="hidden" name="done" value={done ? "0" : "1"} />
            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex items-center gap-1.5 min-h-10 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer ${
                done
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              } ${isPending ? "opacity-80" : ""}`}
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
