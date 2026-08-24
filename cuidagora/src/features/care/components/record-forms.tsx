"use client";

import { useActionState, useState } from "react";

import { VoiceTextArea } from "@/components/a11y/VoiceTextArea";
import { CheckboxField, Fieldset, SelectField, TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import {
  addBloodPressureAction,
  addGlucoseAction,
  addSymptomAction,
  saveCheckinAction,
} from "@/features/care/actions";
import { saveHydrationGoal } from "@/features/preferences/actions";
import { idleState } from "@/lib/action-state";
import { GLUCOSE_CONTEXTS, INTENSITIES, MOODS } from "@/lib/domain";
import { currentTime, todayIso } from "@/lib/date";

/* --------------------------------- Check-in -------------------------------- */

export function CheckinForm({
  defaults,
}: {
  defaults?: { mood?: string; hasPain?: boolean; painNote?: string; didCare?: boolean; note?: string };
}) {
  const [state, action] = useActionState(saveCheckinAction, idleState);
  const [mood, setMood] = useState(defaults?.mood ?? "");
  const [hasPain, setHasPain] = useState(defaults?.hasPain ?? false);

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormFeedback state={state} />

      <Fieldset legend="Como você está se sentindo hoje?" error={state.errors.mood}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOODS.map((option) => {
            const selected = mood === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center font-semibold ${
                  selected
                    ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface)]"
                }`}
              >
                <input
                  type="radio"
                  name="mood"
                  value={option.value}
                  checked={selected}
                  onChange={() => setMood(option.value)}
                  className="sr-only"
                  required
                />
                <span aria-hidden="true" className="text-4xl">
                  {option.emoji}
                </span>
                {option.label}
                {selected ? <span className="text-sm">✔️ escolhido</span> : null}
              </label>
            );
          })}
        </div>
      </Fieldset>

      <CheckboxField
        label="Senti alguma dor hoje"
        name="hasPain"
        defaultChecked={defaults?.hasPain}
        onChange={(event) => setHasPain(event.currentTarget.checked)}
      />

      {hasPain ? (
        <VoiceTextArea
          label="Onde doeu e como foi?"
          name="painNote"
          defaultValue={defaults?.painNote}
          hint="Descreva com suas palavras. Isso não é um diagnóstico."
        />
      ) : null}

      <CheckboxField
        label="Consegui realizar meus cuidados de hoje"
        name="didCare"
        defaultChecked={defaults?.didCare ?? true}
      />

      <VoiceTextArea
        label="Quer acrescentar alguma observação?"
        name="note"
        defaultValue={defaults?.note}
        hint="Ex.: dormi mal, comi pouco, me senti mais disposto."
      />

      <SubmitButton size="lg" icon="✅" pendingLabel="Registrando…">
        Salvar meu check-in
      </SubmitButton>
    </form>
  );
}

/* -------------------------------- Sintomas --------------------------------- */

export function SymptomForm() {
  const [state, action] = useActionState(addSymptomAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Qual sintoma você sentiu?"
        name="name"
        required
        error={state.errors.name}
        placeholder="Ex.: dor de cabeça"
      />
      <SelectField
        label="Intensidade"
        name="intensity"
        required
        defaultValue="1"
        options={INTENSITIES.map((item) => ({ value: String(item.value), label: item.label }))}
        hint="Uma escala simples, só para acompanhar. Não é uma avaliação médica."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Dia" name="date" type="date" required defaultValue={todayIso()} error={state.errors.date} />
        <TextField label="Horário" name="time" type="time" required defaultValue={currentTime()} error={state.errors.time} />
      </div>
      <TextField
        label="Durou quanto tempo (em minutos)"
        name="durationMinutes"
        type="number"
        min={0}
        inputMode="numeric"
        error={state.errors.durationMinutes}
      />
      <VoiceTextArea label="Observações" name="notes" hint="Você pode ditar por voz." />
      <SubmitButton size="lg" icon="📝">
        Registrar sintoma
      </SubmitButton>
    </form>
  );
}

/* -------------------------------- Medições --------------------------------- */

export function BloodPressureForm() {
  const [state, action] = useActionState(addBloodPressureAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Número maior (sistólica)"
          name="systolic"
          type="number"
          inputMode="numeric"
          required
          placeholder="120"
          error={state.errors.systolic}
        />
        <TextField
          label="Número menor (diastólica)"
          name="diastolic"
          type="number"
          inputMode="numeric"
          required
          placeholder="80"
          error={state.errors.diastolic}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Dia" name="date" type="date" required defaultValue={todayIso()} error={state.errors.date} />
        <TextField label="Horário" name="time" type="time" required defaultValue={currentTime()} error={state.errors.time} />
      </div>
      <TextField label="Observação" name="notes" error={state.errors.notes} placeholder="Ex.: em repouso, braço esquerdo" />
      <SubmitButton icon="🩺">Registrar pressão</SubmitButton>
    </form>
  );
}

export function GlucoseForm() {
  const [state, action] = useActionState(addGlucoseAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Valor da glicemia (mg/dL)"
        name="value"
        type="number"
        inputMode="numeric"
        required
        placeholder="95"
        error={state.errors.value}
      />
      <SelectField
        label="Em que momento você mediu"
        name="context"
        defaultValue=""
        options={[
          { value: "", label: "Não quero informar" },
          ...GLUCOSE_CONTEXTS.map((item) => ({ value: item, label: item })),
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Dia" name="date" type="date" required defaultValue={todayIso()} error={state.errors.date} />
        <TextField label="Horário" name="time" type="time" required defaultValue={currentTime()} error={state.errors.time} />
      </div>
      <TextField label="Observação" name="notes" error={state.errors.notes} />
      <SubmitButton icon="🩸">Registrar glicemia</SubmitButton>
    </form>
  );
}

export function HydrationGoalForm({ current }: { current: number }) {
  const [state, action] = useActionState(saveHydrationGoal, idleState);
  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
      <div className="flex-1">
        <TextField
          label="Minha meta de água por dia (ml)"
          name="hydrationGoalMl"
          type="number"
          inputMode="numeric"
          min={500}
          max={6000}
          step={100}
          defaultValue={current}
          error={state.errors.hydrationGoalMl}
          hint="Combine essa meta com seu profissional de saúde."
        />
      </div>
      <SubmitButton icon="💧">Salvar meta</SubmitButton>
      <div className="sr-only" aria-live="polite">
        {state.message}
      </div>
    </form>
  );
}
