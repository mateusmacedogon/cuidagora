import type { Metadata } from "next";

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

export const metadata: Metadata = { title: "Medições — CuidAgora" };

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
        icon="🩺"
        title="Minhas medições"
        description="Anote os números que você mediu. O CuidAgora guarda e organiza, mas não interpreta resultados."
      />

      <SafetyNotice compact />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle icon="🩺" level={2}>
            Registrar pressão arterial
          </CardTitle>
          <BloodPressureForm />
        </Card>

        <Card>
          <CardTitle icon="🩸" level={2}>
            Registrar glicemia
          </CardTitle>
          <GlucoseForm />
        </Card>
      </div>

      <HydrationCard totalMl={hydration} goalMl={user.preferences.hydrationGoalMl} />

      <Card>
        <CardTitle icon="🎯" level={2}>
          Minha meta de hidratação
        </CardTitle>
        <HydrationGoalForm current={user.preferences.hydrationGoalMl} />
      </Card>

      <Card>
        <CardTitle icon="📈" description="Últimos 30 dias.">
          Pressão registrada
        </CardTitle>
        {bloodPressure.length === 0 ? (
          <EmptyState
            icon="🩺"
            title="Nenhuma pressão registrada ainda"
            description="Quando você registrar, os valores aparecem aqui em ordem, do mais recente para o mais antigo."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {bloodPressure.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] p-3"
              >
                <span>
                  <strong className="text-lg">
                    {item.systolic} por {item.diastolic} mmHg
                  </strong>
                  <span className="block text-sm text-[var(--color-ink-soft)]">
                    {formatDateTime(item.measuredAt)}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </span>
                </span>
                <form action={deleteMeasurementAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="kind" value={item.kind} />
                  <button type="submit" className="min-h-11 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                    🗑️ Apagar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle icon="📉" description="Últimos 30 dias.">
          Glicemia registrada
        </CardTitle>
        {glucose.length === 0 ? (
          <EmptyState
            icon="🩸"
            title="Nenhuma glicemia registrada ainda"
            description="Use o formulário acima para registrar o primeiro valor."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {glucose.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] p-3"
              >
                <span>
                  <strong className="text-lg">{Number(item.value)} mg/dL</strong>
                  <span className="block text-sm text-[var(--color-ink-soft)]">
                    {formatDateTime(item.measuredAt)}
                    {item.context ? ` · ${item.context}` : ""}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </span>
                </span>
                <form action={deleteMeasurementAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="kind" value={item.kind} />
                  <button type="submit" className="min-h-11 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                    🗑️ Apagar
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
