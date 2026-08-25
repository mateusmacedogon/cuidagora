import type { Metadata } from "next";
import { Activity, Droplets, Target, Trash2 } from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { EmptyState, SafetyNotice } from "@/components/ui/Feedback";
import { deleteMeasurementAction } from "@/features/care/actions";
import { HydrationCard } from "@/features/care/components/care-widgets";
import {
  BloodPressureForm,
  GlucoseForm,
  HydrationGoalForm,
} from "@/features/care/components/record-forms";
import { getHydrationTotal, listMeasurements } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { addDaysIso, formatDateTime, todayIso } from "@/lib/date";

export const metadata: Metadata = { title: "Medições e Sinais Vitais — CuidAgora" };

export default async function MeasurementsPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const fromIso = addDaysIso(dateIso, -29);

  const [bloodPressure, glucose, hydration] = await Promise.all([
    listMeasurements(user.id, "blood_pressure", fromIso, dateIso),
    listMeasurements(user.id, "glucose", fromIso, dateIso),
    getHydrationTotal(user.id, dateIso),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Activity className="size-7 text-teal-700" />}
        title="Medições e Sinais Vitais"
        description="Acompanhamento sistemático de pressão arterial e glicemia capilar. Os registros servem para apoio ao diálogo com sua equipe de saúde."
      />

      <SafetyNotice compact />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<Activity className="size-5 text-teal-700" />} level={2}>
            Registrar Pressão Arterial
          </CardTitle>
          <BloodPressureForm />
        </Card>

        <Card>
          <CardTitle icon={<Activity className="size-5 text-teal-700" />} level={2}>
            Registrar Glicemia Capilar
          </CardTitle>
          <GlucoseForm />
        </Card>
      </div>

      <HydrationCard totalMl={hydration} goalMl={user.preferences.hydrationGoalMl} />

      <Card>
        <CardTitle icon={<Target className="size-5 text-teal-700" />} level={2}>
          Meta Diária de Hidratação
        </CardTitle>
        <HydrationGoalForm current={user.preferences.hydrationGoalMl} />
      </Card>

      <Card>
        <CardTitle
          icon={<Activity className="size-5 text-teal-700" />}
          description="Histórico de leituras nos últimos 30 dias."
        >
          Pressão Arterial Registrada
        </CardTitle>
        {bloodPressure.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-8 text-teal-600" />}
            title="Nenhuma medição de pressão registrada recentemente"
            description="Utilize o formulário acima para registrar sua primeira aferição de pressão."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {bloodPressure.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <strong className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                    {item.systolic} / {item.diastolic} mmHg
                  </strong>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    {formatDateTime(item.measuredAt)}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </span>
                </div>
                <form action={deleteMeasurementAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="kind" value={item.kind} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    Excluir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle
          icon={<Activity className="size-5 text-teal-700" />}
          description="Histórico de leituras nos últimos 30 dias."
        >
          Glicemia Registrada
        </CardTitle>
        {glucose.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-8 text-teal-600" />}
            title="Nenhuma medição de glicemia registrada recentemente"
            description="Utilize o formulário de glicemia para adicionar a primeira leitura."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {glucose.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <strong className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                    {Number(item.value)} mg/dL
                  </strong>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    {formatDateTime(item.measuredAt)}
                    {item.context ? ` · ${item.context}` : ""}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </span>
                </div>
                <form action={deleteMeasurementAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="kind" value={item.kind} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                    Excluir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
