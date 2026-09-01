import type { Metadata } from "next";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  List,
  Pill,
  Search,
  Smile,
} from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";
import { listTimeline } from "@/features/timeline/service";
import { requireUser } from "@/lib/auth/session";
import { addDaysIso, formatDate, formatTime, todayIso } from "@/lib/date";
import { TIMELINE_CATEGORIES, timelineMeta } from "@/lib/domain";

export const metadata: Metadata = { title: "Linha do Tempo e Histórico — CuidAgora" };

const PERIODS = [
  { value: "hoje", label: "Hoje" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "custom", label: "Período personalizado" },
];

function getCategoryIcon(key: string) {
  switch (key) {
    case "task":
      return <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />;
    case "medication":
      return <Pill className="size-4 text-teal-600 shrink-0" />;
    case "symptom":
      return <FileText className="size-4 text-rose-600 shrink-0" />;
    case "checkin":
      return <Smile className="size-4 text-indigo-600 shrink-0" />;
    case "measurement":
      return <Activity className="size-4 text-blue-600 shrink-0" />;
    case "appointment":
      return <Calendar className="size-4 text-purple-600 shrink-0" />;
    default:
      return <Clock className="size-4 text-slate-500 shrink-0" />;
  }
}

function resolvePeriod(period: string, from?: string, to?: string) {
  const today = todayIso();
  if (period === "custom" && from && to) {
    return { fromIso: from <= to ? from : to, toIso: from <= to ? to : from };
  }
  if (period === "hoje") return { fromIso: today, toIso: today };
  const days = period === "30" ? 30 : 7;
  return { fromIso: addDaysIso(today, -(days - 1)), toIso: today };
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string; categoria?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const period = params.periodo ?? "7";
  const { fromIso, toIso } = resolvePeriod(period, params.de, params.ate);

  const selectedCategories = Array.isArray(params.categoria)
    ? params.categoria
    : params.categoria
      ? [params.categoria]
      : [];

  const events = await listTimeline({
    userId: user.id,
    fromIso,
    toIso,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
  });

  const grouped = new Map<string, typeof events>();
  for (const event of events) {
    const key = formatDate(event.occurredAt);
    grouped.set(key, [...(grouped.get(key) ?? []), event]);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Clock className="size-7 text-teal-700" />}
        title="Linha do Tempo Unificada"
        description="Histórico cronológico de todos os eventos, conclusões de tarefas e medições registradas."
      />

      <Card>
        <CardTitle icon={<Filter className="size-5 text-teal-700" />} level={2}>
          Filtros de Pesquisa
        </CardTitle>
        <form method="get" className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-bold text-slate-900">Período de visualização</legend>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((item) => (
                <label
                  key={item.value}
                  className={`min-h-10 cursor-pointer rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors shadow-2xs ${
                    period === item.value
                      ? "border-teal-300 bg-teal-50 text-teal-900 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="periodo"
                    value={item.value}
                    defaultChecked={period === item.value}
                    className="sr-only"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="de" className="text-xs sm:text-sm font-semibold text-slate-700">
                Data inicial
              </label>
              <input id="de" name="de" type="date" defaultValue={params.de ?? fromIso} className="field-control mt-1" />
            </div>
            <div>
              <label htmlFor="ate" className="text-xs sm:text-sm font-semibold text-slate-700">
                Data final
              </label>
              <input id="ate" name="ate" type="date" defaultValue={params.ate ?? toIso} className="field-control mt-1" />
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-bold text-slate-900">Categorias de eventos</legend>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_CATEGORIES.map((category) => (
                <label
                  key={category.value}
                  className={`min-h-9 flex items-center gap-1.5 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs ${
                    selectedCategories.includes(category.value)
                      ? "border-teal-300 bg-teal-50 text-teal-900 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="categoria"
                    value={category.value}
                    defaultChecked={selectedCategories.includes(category.value)}
                    className="sr-only"
                  />
                  {getCategoryIcon(category.value)}
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 min-h-10 rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-xs cursor-pointer"
            >
              <Search className="size-4" />
              Aplicar filtros
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle
          icon={<List className="size-5 text-teal-700" />}
          description={`De ${formatDate(fromIso)} até ${formatDate(toIso)} · ${events.length} registro(s) encontrado(s)`}
        >
          Eventos Registrados
        </CardTitle>

        {events.length === 0 ? (
          <EmptyState
            icon={<Clock className="size-8 text-teal-600" />}
            title="Nenhum evento registrado no intervalo"
            description="Ao concluir tarefas, aferir pressão ou salvar check-ins, os registros cronológicos aparecem aqui."
            actionLabel="Acessar rotina de cuidados"
            actionHref="/cuidados"
          />
        ) : (
          <ol className="flex flex-col gap-6">
            {[...grouped.entries()].map(([day, dayEvents]) => (
              <li key={day}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">{day}</h3>
                <ul className="flex flex-col gap-2.5 border-l-2 border-teal-200 pl-4">
                  {dayEvents.map((event) => {
                    const meta = timelineMeta(event.category);
                    return (
                      <li
                        key={event.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                          {getCategoryIcon(event.category)}
                          <span className="tabular-nums font-semibold text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {formatTime(event.occurredAt)}
                          </span>
                          <span>{event.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 pl-6">
                          {meta.label}
                          {event.description ? ` · ${event.description}` : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
