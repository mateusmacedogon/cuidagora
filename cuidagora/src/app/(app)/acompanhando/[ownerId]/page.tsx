import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  FileText,
  Lock,
  Pill,
  ShieldAlert,
} from "lucide-react";

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

export const metadata: Metadata = { title: "Acompanhamento Clínico — CuidAgora" };

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
        <PageHeader icon={<ShieldAlert className="size-7 text-rose-600" />} title="Acesso Não Autorizado" />
        <Alert tone="warning" title="Permissão ausente">
          Este paciente não compartilhou dados com sua conta ou a autorização foi revogada.
        </Alert>
        <Link href="/acompanhando" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline">
          <ArrowLeft className="size-4" />
          Voltar para a lista
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
        icon={<Eye className="size-7 text-teal-700" />}
        title={`Acompanhamento de ${access.ownerName}`}
        description="Painel de leitura compartilhada. Seus privilégios não permitem edição ou remoção de dados."
      />
      <div>
        <Link
          href="/acompanhando"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para lista de acompanhados
        </Link>
      </div>

      <Alert tone="info" title="Painel em Modo Cuidador">
        Exibindo apenas os módulos autorizados por {access.ownerName}.
      </Alert>

      {nothingShared ? (
        <EmptyState
          icon={<Lock className="size-8 text-slate-500" />}
          title="Nenhuma permissão específica atribuída"
          description="O acesso foi liberado, mas o paciente ainda não selecionou quais categorias compartilhar."
        />
      ) : null}

      {permissions.tasks ? <TodayTasksCard tasks={tasks} dateIso={dateIso} readOnly /> : null}

      {permissions.measurements ? (
        <HydrationCard totalMl={hydration} goalMl={2000} readOnly />
      ) : null}

      {permissions.medications ? (
        <Card>
          <CardTitle icon={<Pill className="size-5 text-teal-700" />}>
            Medicamentos em Uso
          </CardTitle>
          {medications.length === 0 ? (
            <EmptyState
              icon={<Pill className="size-8 text-teal-600" />}
              title="Nenhum medicamento cadastrado"
              description="Não há prescrições ativas cadastradas no momento."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {medications.map((medication) => (
                <li key={medication.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <strong className="text-base text-slate-900">{medication.name}</strong>
                  <span className="text-slate-600">
                    {medication.dose ? ` — ${medication.dose}` : ""} · {frequencyLabel(medication.frequency)}
                  </span>
                  {medication.times.length > 0 ? (
                    <span className="block text-xs text-slate-500 mt-1">
                      Horários: {medication.times.join(", ")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {permissions.measurements ? (
        <Card>
          <CardTitle
            icon={<Activity className="size-5 text-teal-700" />}
            description="Leituras registradas nos últimos 7 dias."
          >
            Sinais Vitais e Medições
          </CardTitle>
          {measurementsList.length === 0 ? (
            <EmptyState
              icon={<Activity className="size-8 text-teal-600" />}
              title="Sem medições recentes"
              description="Nenhuma aferição foi realizada nos últimos 7 dias."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {measurementsList.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <strong className="text-base text-slate-900 tabular-nums">
                    {item.kind === "blood_pressure"
                      ? `Pressão: ${item.systolic} / ${item.diastolic} mmHg`
                      : item.kind === "glucose"
                        ? `Glicemia: ${Number(item.value)} mg/dL`
                        : `Hidratação: ${Number(item.value)} ml`}
                  </strong>
                  <span className="block text-xs text-slate-500 mt-0.5">
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
          <CardTitle
            icon={<FileText className="size-5 text-teal-700" />}
            description="Registros dos últimos 7 dias."
          >
            Sintomas e Desconfortos
          </CardTitle>
          {symptomList.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-8 text-teal-600" />}
              title="Nenhum sintoma registrado"
              description="Nenhum mal-estar foi reportado recentemente."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {symptomList.map((symptom) => (
                <li key={symptom.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{symptom.name}</strong>
                    <Badge tone="info" icon={<AlertCircle className="size-3" />}>
                      {intensityLabel(symptom.intensity)}
                    </Badge>
                  </div>
                  <span className="block text-xs text-slate-500 mt-1">
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
          <CardTitle icon={<Calendar className="size-5 text-teal-700" />}>
            Próximo Agendamento Médico
          </CardTitle>
          {appointment ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-base font-bold text-slate-900">{appointment.specialty}</p>
              <p className="text-xs text-slate-600 mt-0.5">{formatDateTime(appointment.scheduledAt)}</p>
              {appointment.location ? (
                <p className="text-xs text-slate-500 mt-0.5">Local: {appointment.location}</p>
              ) : null}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="size-8 text-teal-600" />}
              title="Nenhuma consulta futura agendada"
              description="Não constam agendamentos para os próximos dias."
            />
          )}
        </Card>
      ) : null}

      {permissions.timeline ? (
        <Card>
          <CardTitle
            icon={<Clock className="size-5 text-teal-700" />}
            description="Histórico de eventos nos últimos 7 dias."
          >
            Linha do Tempo Recente
          </CardTitle>
          {timeline.length === 0 ? (
            <EmptyState
              icon={<Clock className="size-8 text-teal-600" />}
              title="Sem histórico recente"
              description="Nenhuma atividade realizada no período."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {timeline.map((event) => {
                const meta = timelineMeta(event.category);
                return (
                  <li key={event.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <strong className="text-sm text-slate-900">{event.title}</strong>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {formatDateTime(event.occurredAt)} · {meta.label}
                      {event.description ? ` · ${event.description}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}
