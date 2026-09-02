import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, HelpCircle, History, Plus, Trash2 } from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/ui/Feedback";
import { deleteAppointmentAction } from "@/features/appointments/actions";
import { AppointmentForm } from "@/features/appointments/components/forms";
import { listAppointments, listQuestions } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime, nowUtc } from "@/lib/date";

export const metadata: Metadata = { title: "Agenda de Consultas — CuidAgora" };

export default async function AppointmentsPage() {
  const user = await requireUser();
  const [all, questions] = await Promise.all([listAppointments(user.id), listQuestions(user.id)]);
  const now = nowUtc().getTime();
  const upcoming = all.filter((item) => item.scheduledAt.getTime() >= now);
  const past = all.filter((item) => item.scheduledAt.getTime() < now).reverse();
  const openQuestions = questions.filter((item) => !item.answered);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Calendar className="size-7 text-teal-700" />}
        title="Agenda de Consultas Médicas"
        description="Organização dos agendamentos médicos, dados do profissional e caderno de dúvidas para a consulta."
      />

      <Card>
        <CardTitle
          icon={<Calendar className="size-5 text-teal-700" />}
          description={`${upcoming.length} consulta(s) programada(s)`}
        >
          Próximas Consultas
        </CardTitle>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<Calendar className="size-8 text-teal-600" />}
            title="Nenhuma consulta agendada no momento"
            description="Cadastre seu próximo atendimento médico abaixo para manter as perguntas organizadas."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((appointment) => {
              const related = openQuestions.filter((item) => item.appointmentId === appointment.id);
              return (
                <li
                  key={appointment.id}
                  className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="size-4 text-teal-700" />
                        <span>{appointment.specialty}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                      {appointment.professional ? (
                        <p className="text-xs sm:text-sm text-slate-700 mt-1">Profissional: {appointment.professional}</p>
                      ) : null}
                      {appointment.location ? (
                        <p className="text-xs text-slate-500 mt-0.5">Local: {appointment.location}</p>
                      ) : null}
                      {appointment.notes ? (
                        <p className="mt-1 text-xs text-slate-600 font-medium">Nota: {appointment.notes}</p>
                      ) : null}
                      <div className="mt-2.5">
                        <Badge
                          tone={related.length > 0 ? "info" : "neutral"}
                          icon={<HelpCircle className="size-3" />}
                        >
                          {related.length} pergunta(s) no caderno
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/consultas/${appointment.id}`}
                        className="inline-flex items-center gap-1.5 min-h-9 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                      >
                        Preparar consulta
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <form action={deleteAppointmentAction}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center size-9 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remover agendamento"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle icon={<Plus className="size-5 text-teal-700" />}>
          Cadastrar novo agendamento
        </CardTitle>
        <AppointmentForm />
      </Card>

      {past.length > 0 ? (
        <Card>
          <CardTitle
            icon={<History className="size-5 text-slate-600" />}
            description="Histórico de consultas realizadas anteriormente."
          >
            Consultas Anteriores
          </CardTitle>
          <ul className="flex flex-col gap-2">
            {past.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:bg-slate-100/70 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{appointment.specialty}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(appointment.scheduledAt)}</p>
                </div>
                <Link
                  href={`/consultas/${appointment.id}`}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Ver detalhes →
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
