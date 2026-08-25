import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Edit3,
  FileText,
  HelpCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { SpeakButton } from "@/components/a11y/SpeakButton";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";
import { deleteQuestionAction, toggleQuestionAction } from "@/features/appointments/actions";
import { AppointmentForm, QuestionForm } from "@/features/appointments/components/forms";
import { getAppointment, listQuestions } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime, formatTime, todayIso } from "@/lib/date";

export const metadata: Metadata = { title: "Detalhes da Consulta — CuidAgora" };

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
        icon={<Calendar className="size-7 text-teal-700" />}
        title={appointment.specialty}
        description={formatDateTime(appointment.scheduledAt)}
        action={
          <ButtonLink href="/resumo" variant="secondary" size="sm" icon={<FileText className="size-4" />}>
            Gerar relatório clínico
          </ButtonLink>
        }
      />
      <div>
        <Link
          href="/consultas"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para agenda de consultas
        </Link>
      </div>

      {user.preferences.readAloud ? <SpeakButton text={spoken} label="Ouvir dados da consulta" /> : null}

      <Card>
        <CardTitle
          icon={<HelpCircle className="size-5 text-teal-700" />}
          description="Caderno de perguntas e dúvidas para levar ao atendimento."
        >
          Perguntas para esta consulta
        </CardTitle>
        {questions.length === 0 ? (
          <EmptyState
            icon={<HelpCircle className="size-8 text-teal-600" />}
            title="Nenhuma pergunta salva ainda"
            description="Escreva suas dúvidas abaixo para não esquecer nada durante a conversa com o médico."
          />
        ) : (
          <ul className="mb-5 flex flex-col gap-2.5">
            {questions.map((question) => (
              <li
                key={question.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors shadow-2xs ${
                  question.answered
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 flex-1 min-w-0">
                  <HelpCircle className={`size-4 shrink-0 ${question.answered ? "text-emerald-600" : "text-slate-400"}`} />
                  <span className={question.answered ? "line-through text-slate-500" : ""}>{question.question}</span>
                  {question.answered ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                      Respondida
                    </span>
                  ) : null}
                </span>
                <div className="flex items-center gap-2">
                  <form action={toggleQuestionAction}>
                    <input type="hidden" name="id" value={question.id} />
                    <input type="hidden" name="appointmentId" value={id} />
                    <input type="hidden" name="answered" value={question.answered ? "0" : "1"} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {question.answered ? (
                        <>
                          <RotateCcw className="size-3 text-slate-500" />
                          Desmarcar
                        </>
                      ) : (
                        <>
                          <Check className="size-3 text-emerald-600" />
                          Marcar respondida
                        </>
                      )}
                    </button>
                  </form>
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="id" value={question.id} />
                    <input type="hidden" name="appointmentId" value={id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center size-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir pergunta"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <QuestionForm appointmentId={id} />
      </Card>

      <Card>
        <CardTitle icon={<Edit3 className="size-5 text-teal-700" />}>
          Editar dados da consulta
        </CardTitle>
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
