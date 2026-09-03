"use client";

import { useActionState, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

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
        label="Dosagem prescrita"
        name="dose"
        defaultValue={medication?.dose}
        error={state.errors.dose}
        hint="Informe conforme orientação da receita médica."
        placeholder="Ex.: 1 comprimido de 50 mg"
      />

      <Fieldset
        legend="Horários de administração"
        hint="Defina os horários diários combinados para uso do medicamento."
        error={state.errors.times}
      >
        <div className="flex flex-col gap-3">
          {times.map((time, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor={`time-${index}`} className="text-xs sm:text-sm font-semibold text-slate-700">
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
                  className="field-control mt-1"
                />
              </div>
              {times.length > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="size-4 text-slate-500" />}
                  onClick={() => setTimes((current) => current.filter((_, position) => position !== index))}
                >
                  Remover
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={times.length >= 8}
            icon={<Plus className="size-4" />}
            onClick={() => setTimes((current) => (current.length < 8 ? [...current, "12:00"] : current))}
          >
            Adicionar outro horário
          </Button>
          {times.length >= 8 ? (
            <span className="text-xs text-amber-700 font-medium">
              Limite de 8 horários atingido.
            </span>
          ) : null}
        </div>
      </Fieldset>

      <SelectField
        label="Frequência de uso"
        name="frequency"
        defaultValue={medication?.frequency ?? "daily"}
        options={FREQUENCIES.map((item) => ({ value: item.value, label: item.label }))}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Início do tratamento"
          name="startDate"
          type="date"
          required
          defaultValue={medication?.startDate ?? todayIso()}
          error={state.errors.startDate}
        />
        <TextField
          label="Término previsto"
          name="endDate"
          type="date"
          defaultValue={medication?.endDate ?? ""}
          hint="Deixe em branco caso seja de uso contínuo."
          error={state.errors.endDate}
        />
      </div>

      <TextAreaField
        label="Orientações e observações adicionais"
        name="notes"
        defaultValue={medication?.notes}
        hint="Ex.: tomar após o café da manhã, armazenar em local fresco."
        error={state.errors.notes}
      />

      {!medication?.id ? (
        <CheckboxField
          label="Incluir automaticamente na lista de cuidados diários"
          name="createTasks"
          defaultChecked
          hint="Gera lembretes diários nos horários programados."
        />
      ) : null}

      <SubmitButton size="lg" icon={<Save className="size-5" />}>
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
        label="Descrição da atividade ou cuidado"
        name="title"
        required
        error={state.errors.title}
        placeholder="Ex.: Caminhada leve de 20 minutos"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Horário previsto" name="timeOfDay" type="time" required defaultValue="10:00" error={state.errors.timeOfDay} />
        <SelectField
          label="Categoria do cuidado"
          name="kind"
          required
          defaultValue="other"
          options={TASK_KINDS.map((item) => ({ value: item.value, label: item.label }))}
        />
      </div>
      <TextField
        label="Observações breves"
        name="description"
        error={state.errors.description}
        placeholder="Ex.: no quarteirão de casa, em ritmo confortável"
      />
      <SubmitButton icon={<Plus className="size-4" />}>
        Adicionar ao cronograma
      </SubmitButton>
    </form>
  );
}
