import type { ElementType, ReactNode } from "react";
import {
  Activity,
  CheckCircle2,
  FileText,
  HelpCircle,
  Pill,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smile,
} from "lucide-react";

import { Card, CardTitle } from "@/components/ui/Card";
import { describeRule } from "@/lib/care-status";
import { formatDate, formatDateTime } from "@/lib/date";
import { MOOD_LABELS, SAFETY_NOTICE, frequencyLabel, intensityLabel, type MoodValue } from "@/lib/domain";
import type { SummaryData } from "@/features/summary/data";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-2.5 flex items-center gap-2 border-b border-slate-200 pb-1.5 text-base sm:text-lg font-bold text-slate-900">
        <Icon className="size-5 text-teal-700 shrink-0" aria-hidden="true" />
        <span>{title}</span>
      </h3>
      <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-500 italic">{text}</p>;
}

export function SummaryReport({ summary, personName }: { summary: SummaryData; personName: string }) {
  const { range, adherence } = summary;

  return (
    <Card as="article">
      <CardTitle
        icon={<FileText className="size-5 text-teal-700" />}
        description={`${range.label} · período de ${formatDate(range.fromIso)} até ${formatDate(range.toIso)}`}
      >
        Relatório Clínico Consolidado — {personName}
      </CardTitle>

      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm text-slate-600">
        <Shield className="size-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          <strong>Finalidade Informativa:</strong> {SAFETY_NOTICE} Este documento compila registros fornecidos voluntariamente pela própria pessoa para suporte ao diálogo clínico.
        </p>
      </div>

      <Section title="Medicamentos e Posologia Cadastrada" icon={Pill}>
        {summary.medications.length === 0 ? (
          <Empty text="Nenhum medicamento ativo registrado no período." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.medications.map((medication) => (
              <li key={medication.id}>
                <strong>{medication.name}</strong>
                {medication.dose ? ` — ${medication.dose}` : ""} · {frequencyLabel(medication.frequency)}
                {medication.times.length > 0 ? ` · horários programados: ${medication.times.join(", ")}` : ""}
                {medication.notes ? ` · observações: ${medication.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Adesão aos Cuidados no Período" icon={CheckCircle2}>
        <p className="font-semibold text-slate-900">
          {adherence.completions} cuidado(s) registrado(s) como concluído(s)
          {adherence.expected > 0 ? ` de ${adherence.expected} previsto(s)` : ""}
          {adherence.percent !== null ? ` — ${adherence.percent}% de adesão aos registros.` : "."}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Percentual calculado com base nas confirmações de rotina marcadas no sistema.
        </p>
      </Section>

      <Section title="Registro de Sintomas e Queixas" icon={FileText}>
        {summary.symptoms.length === 0 ? (
          <Empty text="Nenhum sintoma registrado no período selecionado." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.symptoms.map((symptom) => (
              <li key={symptom.id}>
                {formatDateTime(symptom.occurredAt)} — <strong>{symptom.name}</strong> (classificação:{" "}
                {intensityLabel(symptom.intensity)})
                {symptom.durationMinutes ? ` · duração aproximada: ${symptom.durationMinutes} min` : ""}
                {symptom.notes ? ` · relato: ${symptom.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Pressão Arterial Aferida" icon={Activity}>
        {summary.measurements.bloodPressure.length === 0 ? (
          <Empty text="Nenhuma medição de pressão registrada no período." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.measurements.bloodPressure.map((item) => (
              <li key={item.id}>
                {formatDateTime(item.measuredAt)} — <strong>{item.systolic} por {item.diastolic} mmHg</strong>
                {item.notes ? ` · ${item.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Glicemia Capilar" icon={Activity}>
        {summary.measurements.glucose.length === 0 ? (
          <Empty text="Nenhuma medição de glicemia registrada no período." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.measurements.glucose.map((item) => (
              <li key={item.id}>
                {formatDateTime(item.measuredAt)} — <strong>{Number(item.value)} mg/dL</strong>
                {item.context ? ` · contexto: ${item.context}` : ""}
                {item.notes ? ` · ${item.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Histórico de Check-ins Diários" icon={Smile}>
        {summary.checkins.length === 0 ? (
          <Empty text="Nenhum check-in registrado no período." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.checkins.map((checkin) => (
              <li key={checkin.id}>
                {formatDate(checkin.referenceDate)} — Estado geral: <strong>{MOOD_LABELS[checkin.mood as MoodValue]}</strong>
                {checkin.hasPain ? " · relatou desconforto/dor" : ""}
                {checkin.didCare ? "" : " · pendência em cuidados"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Anotações e Relatos Livres" icon={FileText}>
        {summary.notes.length === 0 ? (
          <Empty text="Nenhuma anotação adicional registrada." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.notes.map((note, index) => (
              <li key={`${note.date}-${index}`}>
                {formatDate(note.date)} — “{note.text}”
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Caderno de Dúvidas para o Médico" icon={HelpCircle}>
        {summary.questions.length === 0 ? (
          <Empty text="Nenhuma dúvida cadastrada para esta consulta." />
        ) : (
          <ol className="list-decimal pl-5 space-y-1">
            {summary.questions.map((question) => (
              <li key={question.id}>{question.question}</li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Orientações Clínicas Cadastradas" icon={ShieldCheck}>
        {summary.guidelines.length === 0 ? (
          <Empty text="Nenhuma orientação médica preventiva cadastrada." />
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {summary.guidelines.map((guideline) => (
              <li key={guideline.id}>
                <strong>
                  {guideline.level === "urgent" ? "Alerta Vermelho (Urgência)" : "Alerta Amarelo (Atenção)"} — {guideline.title}
                </strong>
                : {describeRule(guideline)} → “{guideline.instruction}”
                {guideline.source ? ` (origem: ${guideline.source})` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Card>
  );
}
