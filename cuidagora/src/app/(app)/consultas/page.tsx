import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/ui/Feedback";
import { deleteAppointmentAction } from "@/features/appointments/actions";
import { AppointmentForm } from "@/features/appointments/components/forms";
import { listAppointments, listQuestions } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/date";

export const metadata: Metadata = { title: "Minhas Consultas — CuidAgora" };

export default async function AppointmentsPage() {
  const user = await requireUser();
  const [all, questions] = await Promise.all([listAppointments(user.id), listQuestions(user.id)]);
  const now = Date.now();
  const upcoming = all.filter((item) => item.scheduledAt.getTime() >= now);
  const past = all.filter((item) => item.scheduledAt.getTime() < now).reverse();
  const openQuestions = questions.filter((item) => !item.answered);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="📅"
        title="Minhas Consultas"
        description="Guarde data, local e as perguntas que você quer fazer."
      />

      <Card>
        <CardTitle icon="⏭️" description={`${upcoming.length} consulta(s) marcada(s)`}>
          Próximas consultas
        </CardTitle>
        {upcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Nenhuma consulta marcada"
            description="Cadastre sua próxima consulta para receber o lembrete na tela inicial."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((appointment) => {
              const related = openQuestions.filter((item) => item.appointmentId === appointment.id);
              return (
                <li key={appointment.id} className="rounded-2xl border-2 border-[var(--color-line)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        <span aria-hidden="true">🩺 </span>
                        {appointment.specialty}
                      </h3>
                      <p className="text-[var(--color-ink-soft)]">{formatDateTime(appointment.scheduledAt)}</p>
                      {appointment.professional ? <p>Com {appointment.professional}</p> : null}
                      {appointment.location ? <p>Local: {appointment.location}</p> : null}
                      {appointment.notes ? <p className="mt-1 text-sm">Observação: {appointment.notes}</p> : null}
                      <p className="mt-2">
                        <Badge tone={related.length > 0 ? "info" : "neutral"} icon="❓">
                          {related.length} pergunta(s) salva(s)
                        </Badge>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/consultas/${appointment.id}`}
                        className="min-h-12 rounded-full border-2 border-[var(--color-brand)] px-4 py-2 font-semibold text-[var(--color-brand-strong)]"
                      >
                        📝 Abrir e preparar
                      </Link>
                      <form action={deleteAppointmentAction}>
                        <input type="hidden" name="id" value={appointment.id} />
                        <button type="submit" className="min-h-12 rounded-full border-2 border-[var(--color-line)] px-4 py-2 font-semibold">
                          🗑️ Remover
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
        <CardTitle icon="➕">Cadastrar consulta</CardTitle>
        <AppointmentForm />
      </Card>

      {past.length > 0 ? (
        <Card>
          <CardTitle icon="📚">Consultas anteriores</CardTitle>
          <ul className="flex flex-col gap-2">
            {past.map((appointment) => (
              <li key={appointment.id} className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
                <Link href={`/consultas/${appointment.id}`} className="font-semibold underline">
                  {appointment.specialty} — {formatDateTime(appointment.scheduledAt)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
