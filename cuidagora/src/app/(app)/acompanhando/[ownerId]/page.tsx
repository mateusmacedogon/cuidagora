import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert, Badge, EmptyState } from "@/components/ui/Feedback";
import { HydrationCard, TodayTasksCard } from "@/features/care/components/care-widgets";
import {
  getHydrationTotal,
  getNextAppointment,
  listMeasurements,
  listMedications,
  listSymptoms,
  listTasksForDate,
} from "@/features/care/data";
import { listTimeline } from "@/features/timeline/service";
import { resolveAccess } from "@/lib/permissions";
import { addDaysIso, formatDateTime, formatTime, todayIso } from "@/lib/date";
import { frequencyLabel, intensityLabel, timelineMeta } from "@/lib/domain";

export const metadata: Metadata = { title: "Acompanhando — CuidAgora" };

export default async function CaregiverDetailPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;
  const access = await resolveAccess(ownerId);

  if (!access) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader icon="🚫" title="Acesso não disponível" />
        <Alert tone="warning" title="Você não tem permissão">
          Esta pessoa não compartilhou informações com a sua conta, ou o acesso foi removido.
        </Alert>
        <Link href="/acompanhando" className="font-semibold underline">
          ← Voltar
        </Link>
      </div>
    );
  }

  const dateIso = todayIso();
  const permissions = access.permissions;

  const [tasks, medications, measurementsList, symptomList, appointment, hydration, timeline] =
    await Promise.all([
      permissions.tasks ? listTasksForDate(ownerId, dateIso) : Promise.resolve([]),
      permissions.medications ? listMedications(ownerId) : Promise.resolve([]),
      permissions.measurements
        ? listMeasurements(ownerId, null, addDaysIso(dateIso, -6), dateIso)
        : Promise.resolve([]),
      permissions.symptoms ? listSymptoms(ownerId, addDaysIso(dateIso, -6), dateIso) : Promise.resolve([]),
      permissions.appointments ? getNextAppointment(ownerId) : Promise.resolve(null),
      permissions.measurements ? getHydrationTotal(ownerId, dateIso) : Promise.resolve(0),
      permissions.timeline
        ? listTimeline({ userId: ownerId, fromIso: addDaysIso(dateIso, -6), toIso: dateIso, limit: 40 })
        : Promise.resolve([]),
    ]);

  const nothingShared = Object.values(permissions).every((value) => !value);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="👀"
        title={`Acompanhando ${access.ownerName}`}
        description="Visualização somente leitura. Você não pode alterar nenhum registro."
      />
      <Link href="/acompanhando" className="font-semibold underline">
        ← Voltar para a lista
      </Link>

      <Alert tone="info" title="Modo cuidador">
        Você vê apenas o que {access.ownerName} autorizou. A qualquer momento essa autorização pode mudar.
      </Alert>

      {nothingShared ? (
        <EmptyState
          icon="🔒"
          title="Nada foi liberado ainda"
          description="A pessoa autorizou o acesso, mas ainda não marcou quais informações você pode ver."
        />
      ) : null}

      {permissions.tasks ? <TodayTasksCard tasks={tasks} dateIso={dateIso} readOnly /> : null}

      {permissions.measurements ? (
        <HydrationCard totalMl={hydration} goalMl={2000} readOnly />
      ) : null}

      {permissions.medications ? (
        <Card>
          <CardTitle icon="💊">Medicamentos em uso</CardTitle>
          {medications.length === 0 ? (
            <EmptyState icon="💊" title="Nenhum medicamento cadastrado" description="Ainda não há medicamentos na lista." />
          ) : (
            <ul className="flex flex-col gap-2">
              {medications.map((medication) => (
                <li key={medication.id} className="rounded-2xl border border-[var(--color-line)] p-3">
                  <strong>{medication.name}</strong>
                  {medication.dose ? ` — ${medication.dose}` : ""} · {frequencyLabel(medication.frequency)}
                  {medication.times.length > 0 ? ` · ${medication.times.join(", ")}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {permissions.measurements ? (
        <Card>
          <CardTitle icon="🩺" description="Últimos 7 dias.">
            Medições
          </CardTitle>
          {measurementsList.length === 0 ? (
            <EmptyState icon="🩺" title="Sem medições recentes" description="Nada foi registrado nos últimos 7 dias." />
          ) : (
            <ul className="flex flex-col gap-2">
              {measurementsList.map((item) => (
                <li key={item.id} className="rounded-2xl border border-[var(--color-line)] p-3">
                  {item.kind === "blood_pressure"
                    ? `Pressão: ${item.systolic} por ${item.diastolic} mmHg`
                    : item.kind === "glucose"
                      ? `Glicemia: ${Number(item.value)} mg/dL`
                      : `Água: ${Number(item.value)} ml`}
                  <span className="block text-sm text-[var(--color-ink-soft)]">
                    {formatDateTime(item.measuredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {permissions.symptoms ? (
        <Card>
          <CardTitle icon="📝" description="Últimos 7 dias.">
            Sintomas
          </CardTitle>
          {symptomList.length === 0 ? (
            <EmptyState icon="📝" title="Sem sintomas registrados" description="Nada foi anotado nos últimos 7 dias." />
          ) : (
            <ul className="flex flex-col gap-2">
              {symptomList.map((symptom) => (
                <li key={symptom.id} className="rounded-2xl border border-[var(--color-line)] p-3">
                  <strong>{symptom.name}</strong> —{" "}
                  <Badge tone="info" icon="📊">
                    {intensityLabel(symptom.intensity)}
                  </Badge>
                  <span className="block text-sm text-[var(--color-ink-soft)]">
                    {formatDateTime(symptom.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {permissions.appointments ? (
        <Card>
          <CardTitle icon="📅">Próxima consulta</CardTitle>
          {appointment ? (
            <p className="text-lg">
              <strong>{appointment.specialty}</strong> — {formatDateTime(appointment.scheduledAt)}
              {appointment.location ? ` · ${appointment.location}` : ""}
            </p>
          ) : (
            <EmptyState icon="📅" title="Nenhuma consulta marcada" description="Não há consultas futuras cadastradas." />
          )}
        </Card>
      ) : null}

      {permissions.timeline ? (
        <Card>
          <CardTitle icon="🕓" description="Últimos 7 dias.">
            Linha do tempo
          </CardTitle>
          {timeline.length === 0 ? (
            <EmptyState icon="🕓" title="Sem registros recentes" description="Nada foi registrado nos últimos 7 dias." />
          ) : (
            <ul className="flex flex-col gap-2">
              {timeline.map((event) => {
                const meta = timelineMeta(event.category);
                return (
                  <li key={event.id} className="rounded-2xl border border-[var(--color-line)] p-3">
                    <span aria-hidden="true">{meta.icon} </span>
                    <strong>{event.title}</strong>
                    <span className="block text-sm text-[var(--color-ink-soft)]">
                      {formatDateTime(event.occurredAt)} · {meta.label}
                      {event.description ? ` · ${event.description}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="sr-only">Horário do último registro: {timeline[0] ? formatTime(timeline[0].occurredAt) : "nenhum"}</p>
        </Card>
      ) : null}
    </div>
  );
}
