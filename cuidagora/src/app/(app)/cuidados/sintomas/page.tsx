import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Clock, FileText, Plus, Trash2 } from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState, SafetyNotice } from "@/components/ui/Feedback";
import { deleteSymptomAction } from "@/features/care/actions";
import { SymptomForm } from "@/features/care/components/record-forms";
import { listSymptoms } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { addDaysIso, formatDateTime, todayIso } from "@/lib/date";
import { intensityLabel } from "@/lib/domain";

export const metadata: Metadata = { title: "Registro de Sintomas — CuidAgora" };

const INTENSITY_TONE = { 1: "info", 2: "warning", 3: "danger" } as const;

export default async function SymptomsPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const symptoms = await listSymptoms(user.id, addDaysIso(dateIso, -29), dateIso);

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
        icon={<FileText className="size-7 text-teal-700" />}
        title="Registro de Sintomas e Queixas"
        description="Histórico de sintomas relatados para compartilhamento com seu médico na consulta."
      />

      <SafetyNotice compact />

      <Card>
        <CardTitle icon={<Plus className="size-5 text-teal-700" />}>
          Anotar novo sintoma ou mal-estar
        </CardTitle>
        <SymptomForm />
      </Card>

      <Card>
        <CardTitle
          icon={<Clock className="size-5 text-teal-700" />}
          description="Ocorrências registradas nos últimos 30 dias."
        >
          Histórico de Sintomas
        </CardTitle>
        {symptoms.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8 text-teal-600" />}
            title="Nenhum sintoma registrado recentemente"
            description="Caso sinta algum desconforto ou efeito colateral, anote aqui para apoiar o acompanhamento médico."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {symptoms.map((symptom) => (
              <li
                key={symptom.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{symptom.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge
                        tone={INTENSITY_TONE[symptom.intensity as 1 | 2 | 3] ?? "info"}
                        icon={<AlertCircle className="size-3" />}
                      >
                        {intensityLabel(symptom.intensity)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatDateTime(symptom.occurredAt)}
                      {symptom.durationMinutes ? ` · duração de ${symptom.durationMinutes} minutos` : ""}
                    </p>
                    {symptom.notes ? (
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {symptom.notes}
                      </p>
                    ) : null}
                  </div>
                  <form action={deleteSymptomAction}>
                    <input type="hidden" name="id" value={symptom.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                      Excluir
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
