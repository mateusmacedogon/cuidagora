import type { Metadata } from "next";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState, SafetyNotice } from "@/components/ui/Feedback";
import { deleteSymptomAction } from "@/features/care/actions";
import { SymptomForm } from "@/features/care/components/record-forms";
import { listSymptoms } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { addDaysIso, formatDateTime, todayIso } from "@/lib/date";
import { intensityLabel } from "@/lib/domain";

export const metadata: Metadata = { title: "Sintomas — CuidAgora" };

const INTENSITY_TONE = { 1: "info", 2: "warning", 3: "danger" } as const;

export default async function SymptomsPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const symptoms = await listSymptoms(user.id, addDaysIso(dateIso, -29), dateIso);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="📝"
        title="Meus sintomas"
        description="Anote o que você sentiu para lembrar depois e contar ao seu profissional de saúde."
      />

      <SafetyNotice compact />

      <Card>
        <CardTitle icon="➕">Registrar um sintoma</CardTitle>
        <SymptomForm />
      </Card>

      <Card>
        <CardTitle icon="🕓" description="Últimos 30 dias.">
          Sintomas registrados
        </CardTitle>
        {symptoms.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Você ainda não registrou sintomas"
            description="Se sentir algo diferente, registre aqui. Isso ajuda a lembrar dos detalhes na consulta."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {symptoms.map((symptom) => (
              <li key={symptom.id} className="rounded-2xl border-2 border-[var(--color-line)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{symptom.name}</h3>
                    <p className="mt-1">
                      <Badge tone={INTENSITY_TONE[symptom.intensity as 1 | 2 | 3] ?? "info"} icon="📊">
                        Intensidade: {intensityLabel(symptom.intensity)}
                      </Badge>
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                      {formatDateTime(symptom.occurredAt)}
                      {symptom.durationMinutes ? ` · durou ${symptom.durationMinutes} minutos` : ""}
                    </p>
                    {symptom.notes ? <p className="mt-1">{symptom.notes}</p> : null}
                  </div>
                  <form action={deleteSymptomAction}>
                    <input type="hidden" name="id" value={symptom.id} />
                    <button type="submit" className="min-h-11 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                      🗑️ Apagar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
