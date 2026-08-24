import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState, SafetyNotice } from "@/components/ui/Feedback";
import { archiveMedicationAction } from "@/features/care/actions";
import { MedicationForm } from "@/features/care/components/medication-forms";
import { listMedications } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/date";
import { frequencyLabel } from "@/lib/domain";

export const metadata: Metadata = { title: "Medicamentos — CuidAgora" };

export default async function MedicationsPage() {
  const user = await requireUser();
  const all = await listMedications(user.id, { includeArchived: true });
  const active = all.filter((item) => !item.archivedAt);
  const archived = all.filter((item) => item.archivedAt);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="💊"
        title="Meus medicamentos"
        description="Cadastre exatamente o que está na sua receita. O CuidAgora só organiza — nunca indica medicamentos nem doses."
      />

      <SafetyNotice compact />

      <Card>
        <CardTitle icon="📋" description={`${active.length} medicamento(s) em uso`}>
          Lista de medicamentos
        </CardTitle>

        {active.length === 0 ? (
          <EmptyState
            icon="💊"
            title="Você ainda não cadastrou medicamentos"
            description="Cadastre o primeiro logo abaixo. Depois ele aparece automaticamente nos cuidados do dia."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((medication) => (
              <li key={medication.id} className="rounded-2xl border-2 border-[var(--color-line)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">
                      <span aria-hidden="true">💊 </span>
                      {medication.name}
                    </h3>
                    <p className="text-[var(--color-ink-soft)]">
                      {medication.dose ? `${medication.dose} · ` : ""}
                      {frequencyLabel(medication.frequency)}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-2">
                      {medication.times.map((time) => (
                        <Badge key={time} tone="info" icon="⏰">
                          {time}
                        </Badge>
                      ))}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                      Início em {formatDate(medication.startDate)}
                      {medication.endDate ? ` · até ${formatDate(medication.endDate)}` : " · uso contínuo"}
                    </p>
                    {medication.notes ? (
                      <p className="mt-1 text-sm">Observação: {medication.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/cuidados/medicamentos/${medication.id}`}
                      className="min-h-12 rounded-full border-2 border-[var(--color-brand)] px-4 py-2 font-semibold text-[var(--color-brand-strong)]"
                    >
                      ✏️ Editar
                    </Link>
                    <form action={archiveMedicationAction}>
                      <input type="hidden" name="id" value={medication.id} />
                      <button
                        type="submit"
                        className="min-h-12 rounded-full border-2 border-[var(--color-line)] px-4 py-2 font-semibold"
                      >
                        📦 Arquivar
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle icon="➕">Cadastrar novo medicamento</CardTitle>
        <MedicationForm />
      </Card>

      {archived.length > 0 ? (
        <Card>
          <CardTitle icon="📦" description="Ficam guardados no seu histórico.">
            Medicamentos arquivados
          </CardTitle>
          <ul className="flex flex-col gap-2">
            {archived.map((medication) => (
              <li
                key={medication.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--color-surface-muted)] p-3"
              >
                <span className="font-semibold">
                  {medication.name} {medication.dose ? `· ${medication.dose}` : ""}
                </span>
                <form action={archiveMedicationAction}>
                  <input type="hidden" name="id" value={medication.id} />
                  <input type="hidden" name="restore" value="1" />
                  <button type="submit" className="min-h-11 rounded-full border-2 border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold">
                    ↩️ Voltar a usar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
