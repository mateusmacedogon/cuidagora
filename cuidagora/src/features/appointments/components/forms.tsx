"use client";

import { useActionState } from "react";
import { Calendar, HelpCircle, Save } from "lucide-react";

import { TextAreaField, TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import { addQuestionAction, saveAppointmentAction } from "@/features/appointments/actions";
import { idleState } from "@/lib/action-state";
import { todayIso } from "@/lib/date";

type AppointmentValues = {
  id?: string;
  specialty?: string;
  professional?: string;
  location?: string;
  date?: string;
  time?: string;
  notes?: string;
};

export function AppointmentForm({ appointment }: { appointment?: AppointmentValues }) {
  const [state, action] = useActionState(saveAppointmentAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      {appointment?.id ? <input type="hidden" name="id" value={appointment.id} /> : null}
      <TextField
        label="Especialidade médica / área"
        name="specialty"
        required
        defaultValue={appointment?.specialty}
        error={state.errors.specialty}
        placeholder="Ex.: Cardiologia, Geriatria, Oftalmologia"
      />
      <TextField
        label="Profissional de saúde"
        name="professional"
        defaultValue={appointment?.professional}
        error={state.errors.professional}
        placeholder="Ex.: Dra. Ana Fictícia"
      />
      <TextField
        label="Local da consulta ou endereço"
        name="location"
        defaultValue={appointment?.location}
        error={state.errors.location}
        placeholder="Ex.: Centro Médico Saúde — Sala 402"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Data agendada"
          name="date"
          type="date"
          required
          defaultValue={appointment?.date ?? todayIso()}
          error={state.errors.date}
        />
        <TextField
          label="Horário"
          name="time"
          type="time"
          required
          defaultValue={appointment?.time ?? "09:00"}
          error={state.errors.time}
        />
      </div>
      <TextAreaField
        label="Instruções e lembretes"
        name="notes"
        defaultValue={appointment?.notes}
        hint="Ex.: levar histórico de pressão, resultados de exames de sangue, ir em jejum."
        error={state.errors.notes}
      />
      <SubmitButton size="lg" icon={<Calendar className="size-5" />}>
        {appointment?.id ? "Salvar alterações" : "Confirmar agendamento"}
      </SubmitButton>
    </form>
  );
}

export function QuestionForm({ appointmentId }: { appointmentId?: string }) {
  const [state, action] = useActionState(addQuestionAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      <FormFeedback state={state} />
      {appointmentId ? <input type="hidden" name="appointmentId" value={appointmentId} /> : null}
      <TextField
        label="Dúvida ou ponto a esclarecer na consulta"
        name="question"
        required
        error={state.errors.question}
        placeholder="Ex.: Posso continuar caminhando todos os dias com a dosagem atual?"
      />
      <SubmitButton icon={<HelpCircle className="size-4" />}>
        Registrar pergunta no caderno
      </SubmitButton>
    </form>
  );
}
