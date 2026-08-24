import { Card, CardTitle } from "@/components/ui/Card";
import { describeRule } from "@/lib/care-status";
import { formatDate, formatDateTime } from "@/lib/date";
import { MOOD_LABELS, SAFETY_NOTICE, frequencyLabel, intensityLabel, type MoodValue } from "@/lib/domain";
import type { SummaryData } from "@/features/summary/data";

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 border-b-2 border-[var(--color-line)] pb-1 text-lg font-bold">
        <span aria-hidden="true">{icon} </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[var(--color-ink-soft)]">{text}</p>;
}

export function SummaryReport({ summary, personName }: { summary: SummaryData; personName: string }) {
  const { range, adherence } = summary;

  return (
    <Card as="article">
      <CardTitle
        icon="📄"
        description={`${range.label} · de ${formatDate(range.fromIso)} até ${formatDate(range.toIso)}`}
      >
        Resumo de {personName}
      </CardTitle>

      <p className="mb-5 rounded-xl bg-[var(--color-surface-muted)] p-3 text-sm">
        <strong>Aviso:</strong> {SAFETY_NOTICE} Este documento apenas organiza informações registradas pela
        própria pessoa.
      </p>

      <Section title="Medicamentos cadastrados" icon="💊">
        {summary.medications.length === 0 ? (
          <Empty text="Nenhum medicamento cadastrado." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.medications.map((medication) => (
              <li key={medication.id}>
                <strong>{medication.name}</strong>
                {medication.dose ? ` — ${medication.dose}` : ""} · {frequencyLabel(medication.frequency)}
                {medication.times.length > 0 ? ` · horários: ${medication.times.join(", ")}` : ""}
                {medication.notes ? ` · ${medication.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Cuidados realizados no período" icon="✅">
        <p>
          {adherence.completions} cuidado(s) marcado(s) como concluído(s)
          {adherence.expected > 0 ? ` de ${adherence.expected} previsto(s)` : ""}
          {adherence.percent !== null ? ` — ${adherence.percent}% de registro de adesão.` : "."}
        </p>
        <p className="text-sm text-[var(--color-ink-soft)]">
          O número representa apenas o que foi marcado no aplicativo.
        </p>
      </Section>

      <Section title="Sintomas registrados" icon="📝">
        {summary.symptoms.length === 0 ? (
          <Empty text="Nenhum sintoma registrado no período." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.symptoms.map((symptom) => (
              <li key={symptom.id}>
                {formatDateTime(symptom.occurredAt)} — <strong>{symptom.name}</strong> (intensidade{" "}
                {intensityLabel(symptom.intensity)})
                {symptom.durationMinutes ? ` · durou ${symptom.durationMinutes} min` : ""}
                {symptom.notes ? ` · ${symptom.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Pressão arterial" icon="🩺">
        {summary.measurements.bloodPressure.length === 0 ? (
          <Empty text="Nenhuma medição de pressão no período." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.measurements.bloodPressure.map((item) => (
              <li key={item.id}>
                {formatDateTime(item.measuredAt)} — {item.systolic} por {item.diastolic} mmHg
                {item.notes ? ` · ${item.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Glicemia" icon="🩸">
        {summary.measurements.glucose.length === 0 ? (
          <Empty text="Nenhuma medição de glicemia no período." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.measurements.glucose.map((item) => (
              <li key={item.id}>
                {formatDateTime(item.measuredAt)} — {Number(item.value)} mg/dL
                {item.context ? ` · ${item.context}` : ""}
                {item.notes ? ` · ${item.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Check-ins diários" icon="😊">
        {summary.checkins.length === 0 ? (
          <Empty text="Nenhum check-in registrado no período." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.checkins.map((checkin) => (
              <li key={checkin.id}>
                {formatDate(checkin.referenceDate)} — {MOOD_LABELS[checkin.mood as MoodValue]}
                {checkin.hasPain ? " · relatou dor" : ""}
                {checkin.didCare ? "" : " · não conseguiu realizar os cuidados"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Observações escritas pela pessoa" icon="🗒️">
        {summary.notes.length === 0 ? (
          <Empty text="Nenhuma observação registrada." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.notes.map((note, index) => (
              <li key={`${note.date}-${index}`}>
                {formatDate(note.date)} — {note.text}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Perguntas para o profissional" icon="❓">
        {summary.questions.length === 0 ? (
          <Empty text="Nenhuma pergunta salva." />
        ) : (
          <ol className="list-decimal pl-5">
            {summary.questions.map((question) => (
              <li key={question.id}>{question.question}</li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Orientações previamente cadastradas" icon="🧭">
        {summary.guidelines.length === 0 ? (
          <Empty text="Nenhuma orientação cadastrada." />
        ) : (
          <ul className="list-disc pl-5">
            {summary.guidelines.map((guideline) => (
              <li key={guideline.id}>
                <strong>
                  {guideline.level === "urgent" ? "🔴 Urgente" : "🟡 Atenção"} — {guideline.title}
                </strong>
                : {describeRule(guideline)} → “{guideline.instruction}”
                {guideline.source ? ` (cadastrada por ${guideline.source})` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Card>
  );
}
