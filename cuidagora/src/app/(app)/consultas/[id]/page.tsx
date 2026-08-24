import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SpeakButton } from "@/components/a11y/SpeakButton";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";
import { deleteQuestionAction, toggleQuestionAction } from "@/features/appointments/actions";
import { AppointmentForm, QuestionForm } from "@/features/appointments/components/forms";
import { getAppointment, listQuestions } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime, formatTime, todayIso } from "@/lib/date";

export const metadata: Metadata = { title: "Consulta — CuidAgora" };

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const appointment = await getAppointment(user.id, id);
  if (!appointment) notFound();

  const questions = await listQuestions(user.id, id);
  const dateIso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    appointment.scheduledAt,
  );

  const spoken = [
    `Consulta de ${appointment.specialty} em ${formatDateTime(appointment.scheduledAt)}.`,
    appointment.professional ? `Com ${appointment.professional}.` : "",
    appointment.location ? `Local: ${appointment.location}.` : "",
    questions.length > 0
      ? `Você tem ${questions.length} perguntas salvas: ${questions.map((item) => item.question).join("; ")}`
      : "Nenhuma pergunta salva ainda.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="🩺"
        title={appointment.specialty}
        description={formatDateTime(appointment.scheduledAt)}
        action={<ButtonLink href="/resumo" variant="secondary" icon="📄">Gerar resumo</ButtonLink>}
      />
      <Link href="/consultas" className="font-semibold underline">
        ← Voltar para minhas consultas
      </Link>

      {user.preferences.readAloud ? <SpeakButton text={spoken} label="Ouvir os dados da consulta" /> : null}

      <Card>
        <CardTitle icon="❓" description="Leve suas dúvidas anotadas. Assim nada é esquecido.">
          Perguntas para esta consulta
        </CardTitle>
        {questions.length === 0 ? (
          <EmptyState
            icon="❓"
            title="Nenhuma pergunta salva"
            description="Escreva abaixo o que você quer perguntar ao profissional."
          />
        ) : (
          <ul className="mb-5 flex flex-col gap-2">
            {questions.map((question) => (
              <li
                key={question.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 p-3 ${
                  question.answered
                    ? "border-[var(--color-good)] bg-[var(--color-good-soft)]"
                    : "border-[var(--color-line)]"
                }`}
              >
                <span className="font-medium">
                  <span aria-hidden="true">{question.answered ? "✔️ " : "❓ "}</span>
                  {question.question}
                  {question.answered ? <span className="ml-2 text-sm font-bold">(respondida)</span> : null}
                </span>
                <span className="flex gap-2">
                  <form action={toggleQuestionAction}>
                    <input type="hidden" name="id" value={question.id} />
                    <input type="hidden" name="appointmentId" value={id} />
                    <input type="hidden" name="answered" value={question.answered ? "0" : "1"} />
                    <button type="submit" className="min-h-11 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                      {question.answered ? "↩️ Desmarcar" : "✔️ Já foi respondida"}
                    </button>
                  </form>
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="id" value={question.id} />
                    <input type="hidden" name="appointmentId" value={id} />
                    <button type="submit" className="min-h-11 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                      🗑️
                      <span className="sr-only">Apagar pergunta</span>
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
        <QuestionForm appointmentId={id} />
      </Card>

      <Card>
        <CardTitle icon="✏️">Editar dados da consulta</CardTitle>
        <AppointmentForm
          appointment={{
            id: appointment.id,
            specialty: appointment.specialty,
            professional: appointment.professional,
            location: appointment.location,
            notes: appointment.notes,
            date: dateIso || todayIso(),
            time: formatTime(appointment.scheduledAt),
          }}
        />
      </Card>
    </div>
  );
}
