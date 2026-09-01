import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArrowLeft, Clock, Edit3, Pill, Plus, RotateCcw } from "lucide-react";

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
      <div>
        <Link
          href="/cuidados"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar para Plano de Cuidados
        </Link>
      </div>

      <PageHeader
        icon={<Pill className="size-7 text-teal-700" />}
        title="Gestão de Medicamentos"
        description="Organização das prescrições ativas, dosagens e horários. O CuidAgora não sugere dosagens nem substitui receitas médicas."
      />

      <SafetyNotice compact />

      <Card>
        <CardTitle
          icon={<Pill className="size-5 text-teal-700" />}
          description={`${active.length} medicamento(s) em uso ativo`}
        >
          Medicamentos em Uso
        </CardTitle>

        {active.length === 0 ? (
          <EmptyState
            icon={<Pill className="size-8 text-teal-600" />}
            title="Nenhum medicamento cadastrado ainda"
            description="Cadastre seus medicamentos no formulário abaixo para receber lembretes automáticos na rotina."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((medication) => (
              <li
                key={medication.id}
                className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Pill className="size-4 text-teal-700 shrink-0" />
                      <span>{medication.name}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      {medication.dose ? `${medication.dose} · ` : ""}
                      {frequencyLabel(medication.frequency)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {medication.times.map((time) => (
                        <Badge key={time} tone="info" icon={<Clock className="size-3" />}>
                          {time}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Início em {formatDate(medication.startDate)}
                      {medication.endDate ? ` · até ${formatDate(medication.endDate)}` : " · uso contínuo"}
                    </p>
                    {medication.notes ? (
                      <p className="mt-1 text-xs text-slate-600 font-medium">Nota: {medication.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/cuidados/medicamentos/${medication.id}`}
                      className="inline-flex items-center gap-1.5 min-h-9 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <Edit3 className="size-3.5" />
                      Editar
                    </Link>
                    <form action={archiveMedicationAction}>
                      <input type="hidden" name="id" value={medication.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Archive className="size-3.5 text-slate-400" />
                        Arquivar
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
        <CardTitle icon={<Plus className="size-5 text-teal-700" />}>
          Cadastrar novo medicamento
        </CardTitle>
        <MedicationForm />
      </Card>

      {archived.length > 0 ? (
        <Card>
          <CardTitle
            icon={<Archive className="size-5 text-slate-600" />}
            description="Histórico de tratamentos concluídos ou suspensos."
          >
            Medicamentos Arquivados
          </CardTitle>
          <ul className="flex flex-col gap-2">
            {archived.map((medication) => (
              <li
                key={medication.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {medication.name} {medication.dose ? `· ${medication.dose}` : ""}
                </span>
                <form action={archiveMedicationAction}>
                  <input type="hidden" name="id" value={medication.id} />
                  <input type="hidden" name="restore" value="1" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 min-h-8 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-3 text-slate-500" />
                    Reativar
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
