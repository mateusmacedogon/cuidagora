"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { CheckboxField, Fieldset, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import { saveMedicationAction, saveTaskAction } from "@/features/care/actions";
import { idleState } from "@/lib/action-state";
import { FREQUENCIES, TASK_KINDS } from "@/lib/domain";
import { todayIso } from "@/lib/date";

type MedicationFormValues = {
  id?: string;
  name?: string;
  dose?: string;
  frequency?: string;
  notes?: string;
  startDate?: string;
  endDate?: string | null;
  times?: string[];
};

export function MedicationForm({ medication }: { medication?: MedicationFormValues }) {
  const [state, action] = useActionState(saveMedicationAction, idleState);
  const [times, setTimes] = useState<string[]>(
    medication?.times && medication.times.length > 0 ? medication.times : ["08:00"],
  );

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      {medication?.id ? <input type="hidden" name="id" value={medication.id} /> : null}

      <TextField
        label="Nome do medicamento"
        name="name"
        required
        defaultValue={medication?.name}
        error={state.errors.name}
        placeholder="Ex.: Losartana"
      />
      <TextField
        label="Dose que você usa"
        name="dose"
        defaultValue={medication?.dose}
        error={state.errors.dose}
        hint="Escreva exatamente como está na receita. O CuidAgora nunca sugere doses."
        placeholder="Ex.: 1 comprimido de 50 mg"
      />

      <Fieldset
        legend="Horários"
        hint="Adicione um horário para cada vez que você toma o medicamento."
        error={state.errors.times}
      >
        <div className="flex flex-col gap-3">
          {times.map((time, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor={`time-${index}`} className="text-sm font-semibold">
                  {index + 1}º horário
                </label>
                <input
                  id={`time-${index}`}
                  name="times[]"
                  type="time"
                  value={time}
                  required
                  onChange={(event) =>
                    setTimes((current) =>
                      current.map((item, position) => (position === index ? event.target.value : item)),
                    )
                  }
                  className="field-control"
                />
              </div>
              {times.length > 1 ? (
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => setTimes((current) => current.filter((_, position) => position !== index))}
                >
                  Remover
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          icon="➕"
          onClick={() => setTimes((current) => [...current, "12:00"])}
        >
          Adicionar outro horário
        </Button>
      </Fieldset>

      <SelectField
        label="Com que frequência"
        name="frequency"
        defaultValue={medication?.frequency ?? "daily"}
        options={FREQUENCIES.map((item) => ({ value: item.value, label: item.label }))}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Começou em"
          name="startDate"
          type="date"
          required
          defaultValue={medication?.startDate ?? todayIso()}
          error={state.errors.startDate}
        />
        <TextField
          label="Termina em"
          name="endDate"
          type="date"
          defaultValue={medication?.endDate ?? ""}
          hint="Deixe em branco se for de uso contínuo."
          error={state.errors.endDate}
        />
      </div>

      <TextAreaField
        label="Observações"
        name="notes"
        defaultValue={medication?.notes}
        hint="Ex.: tomar junto com alimento, guardar na geladeira."
        error={state.errors.notes}
      />

      {!medication?.id ? (
        <CheckboxField
          label="Adicionar automaticamente aos meus cuidados do dia"
          name="createTasks"
          defaultChecked
          hint="Assim o medicamento aparece na lista de hoje nos horários informados."
        />
      ) : null}

      <SubmitButton size="lg" icon="💾">
        {medication?.id ? "Salvar alterações" : "Cadastrar medicamento"}
      </SubmitButton>
    </form>
  );
}

export function CareTaskForm() {
  const [state, action] = useActionState(saveTaskAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="O que você quer lembrar de fazer?"
        name="title"
        required
        error={state.errors.title}
        placeholder="Ex.: Caminhar 20 minutos"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Em que horário" name="timeOfDay" type="time" required defaultValue="10:00" error={state.errors.timeOfDay} />
        <SelectField
          label="Tipo de cuidado"
          name="kind"
          required
          defaultValue="other"
          options={TASK_KINDS.map((item) => ({ value: item.value, label: `${item.icon} ${item.label}` }))}
        />
      </div>
      <TextField
        label="Uma descrição curta"
        name="description"
        error={state.errors.description}
        placeholder="Ex.: no quarteirão de casa"
      />
      <SubmitButton icon="➕">Adicionar cuidado</SubmitButton>
    </form>
  );
}
