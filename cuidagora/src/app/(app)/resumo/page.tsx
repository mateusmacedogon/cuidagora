import type { Metadata } from "next";
import { Calendar, FileText } from "lucide-react";

import { PrintButton } from "@/features/summary/components/PrintButton";
import { SummaryReport } from "@/features/summary/components/SummaryReport";
import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { SafetyNotice } from "@/components/ui/Feedback";
import { buildSummary, resolveRange } from "@/features/summary/data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Relatório para Consulta Médica — CuidAgora" };

const PRESETS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "15", label: "Últimos 15 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "custom", label: "Período personalizado" },
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
          icon={<FileText className="size-7 text-teal-700" />}
          title="Relatório Estruturado para Consulta"
          description="Documento clínico consolidado compilando adesão, medicamentos, histórico de pressão, glicemia e sintomas."
        />
      </div>

      <div className="no-print">
        <SafetyNotice compact />
      </div>

      <Card className="no-print">
        <CardTitle icon={<Calendar className="size-5 text-teal-700" />} level={2}>
          Intervalo do Relatório
        </CardTitle>
        <form method="get" className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-bold text-slate-900">Período de compilação</legend>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((item) => (
                <label
                  key={item.value}
                  className={`min-h-10 cursor-pointer rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors shadow-2xs ${
                    preset === item.value
                      ? "border-teal-300 bg-teal-50 text-teal-900 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
              <label htmlFor="de" className="text-xs sm:text-sm font-semibold text-slate-700">
                Data inicial
              </label>
              <input id="de" name="de" type="date" defaultValue={params.de ?? range.fromIso} className="field-control mt-1" />
            </div>
            <div>
              <label htmlFor="ate" className="text-xs sm:text-sm font-semibold text-slate-700">
                Data final
              </label>
              <input id="ate" name="ate" type="date" defaultValue={params.ate ?? range.toIso} className="field-control mt-1" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 min-h-11 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="size-4" />
              Atualizar relatório
            </button>
            <PrintButton />
          </div>
        </form>
      </Card>

      <SummaryReport summary={summary} personName={user.name} />
    </div>
  );
}
