import type { Metadata } from "next";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";
import { listTimeline } from "@/features/timeline/service";
import { requireUser } from "@/lib/auth/session";
import { addDaysIso, formatDate, formatTime, todayIso } from "@/lib/date";
import { TIMELINE_CATEGORIES, timelineMeta } from "@/lib/domain";

export const metadata: Metadata = { title: "Minha Linha do Tempo — CuidAgora" };

const PERIODS = [
  { value: "hoje", label: "Hoje" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "custom", label: "Período que eu escolher" },
];

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
        icon="🕓"
        title="Minha Linha do Tempo"
        description="Tudo o que você registrou, em ordem, do mais recente para o mais antigo."
      />

      <Card>
        <CardTitle icon="🔎" level={2}>
          Filtrar
        </CardTitle>
        <form method="get" className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-base font-semibold">Período</legend>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((item) => (
                <label
                  key={item.value}
                  className={`min-h-12 cursor-pointer rounded-full border-2 px-5 py-2.5 font-semibold ${
                    period === item.value
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]"
                      : "border-[var(--color-line)]"
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
              <label htmlFor="de" className="text-base font-semibold">
                De (para período escolhido)
              </label>
              <input id="de" name="de" type="date" defaultValue={params.de ?? fromIso} className="field-control" />
            </div>
            <div>
              <label htmlFor="ate" className="text-base font-semibold">
                Até
              </label>
              <input id="ate" name="ate" type="date" defaultValue={params.ate ?? toIso} className="field-control" />
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-base font-semibold">Categorias (deixe vazio para ver tudo)</legend>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_CATEGORIES.map((category) => (
                <label
                  key={category.value}
                  className={`min-h-12 cursor-pointer rounded-full border-2 px-4 py-2.5 font-semibold ${
                    selectedCategories.includes(category.value)
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]"
                      : "border-[var(--color-line)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="categoria"
                    value={category.value}
                    defaultChecked={selectedCategories.includes(category.value)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{category.icon} </span>
                  {category.label}
                  {selectedCategories.includes(category.value) ? <span className="sr-only">(selecionado)</span> : null}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <button
              type="submit"
              className="min-h-12 rounded-full bg-[var(--color-brand)] px-6 py-3 font-semibold text-white"
            >
              🔎 Aplicar filtros
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle icon="📜" description={`De ${formatDate(fromIso)} até ${formatDate(toIso)} · ${events.length} registro(s)`}>
          Registros
        </CardTitle>

        {events.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Nada registrado neste período"
            description="Quando você marcar cuidados, registrar medições ou fazer o check-in, tudo aparece aqui."
            actionLabel="Ir para os cuidados de hoje"
            actionHref="/cuidados"
          />
        ) : (
          <ol className="flex flex-col gap-6">
            {[...grouped.entries()].map(([day, dayEvents]) => (
              <li key={day}>
                <h3 className="mb-2 text-lg font-bold">{day}</h3>
                <ul className="flex flex-col gap-2 border-l-4 border-[var(--color-brand-soft)] pl-4">
                  {dayEvents.map((event) => {
                    const meta = timelineMeta(event.category);
                    return (
                      <li key={event.id} className="rounded-2xl border border-[var(--color-line)] p-3">
                        <p className="font-semibold">
                          <span aria-hidden="true">{meta.icon} </span>
                          <span className="tabular-nums">{formatTime(event.occurredAt)}</span> — {event.title}
                        </p>
                        <p className="text-sm text-[var(--color-ink-soft)]">
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
