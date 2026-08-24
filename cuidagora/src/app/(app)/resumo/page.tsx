import type { Metadata } from "next";

import { PrintButton } from "@/features/summary/components/PrintButton";
import { SummaryReport } from "@/features/summary/components/SummaryReport";
import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { SafetyNotice } from "@/components/ui/Feedback";
import { buildSummary, resolveRange } from "@/features/summary/data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Resumo para Consulta — CuidAgora" };

const PRESETS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "15", label: "Últimos 15 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "custom", label: "Período que eu escolher" },
];

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const preset = params.periodo ?? "7";
  const range = resolveRange(preset, params.de, params.ate);
  const summary = await buildSummary(user.id, range);

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print">
        <PageHeader
          icon="📄"
          title="Gerar Resumo para Consulta"
          description="Um documento organizado com o que você registrou. Serve para levar impresso ou mostrar na tela."
        />
      </div>

      <div className="no-print">
        <SafetyNotice compact />
      </div>

      <Card className="no-print">
        <CardTitle icon="🗓️" level={2}>
          Escolha o período
        </CardTitle>
        <form method="get" className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-base font-semibold">Período</legend>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((item) => (
                <label
                  key={item.value}
                  className={`min-h-12 cursor-pointer rounded-full border-2 px-5 py-2.5 font-semibold ${
                    preset === item.value
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]"
                      : "border-[var(--color-line)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="periodo"
                    value={item.value}
                    defaultChecked={preset === item.value}
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
                De
              </label>
              <input id="de" name="de" type="date" defaultValue={params.de ?? range.fromIso} className="field-control" />
            </div>
            <div>
              <label htmlFor="ate" className="text-base font-semibold">
                Até
              </label>
              <input id="ate" name="ate" type="date" defaultValue={params.ate ?? range.toIso} className="field-control" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="min-h-12 rounded-full bg-[var(--color-brand)] px-6 py-3 font-semibold text-white">
              📄 Gerar resumo
            </button>
            <PrintButton />
          </div>
        </form>
      </Card>

      <SummaryReport summary={summary} personName={user.name} />
    </div>
  );
}
