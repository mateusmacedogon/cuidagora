"use client";

import { useActionState, useState } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  Droplets,
  FileText,
  Frown,
  Meh,
  Save,
  Smile,
  SmilePlus,
} from "lucide-react";

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

function getMoodIcon(key: string, selected: boolean) {
  const baseClass = `size-8 transition-transform ${selected ? "scale-110" : ""}`;
  switch (key) {
    case "good":
      return <Smile className={`${baseClass} text-emerald-600`} />;
    case "ok":
      return <SmilePlus className={`${baseClass} text-teal-600`} />;
    case "soso":
      return <Meh className={`${baseClass} text-amber-600`} />;
    case "bad":
      return <Frown className={`${baseClass} text-rose-600`} />;
    default:
      return <Smile className={`${baseClass} text-slate-500`} />;
  }
}

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
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 text-center font-semibold transition-all duration-150 shadow-2xs ${
                  selected
                    ? "border-teal-400 bg-teal-50/90 text-teal-900 ring-2 ring-teal-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
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
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-50">
                  {getMoodIcon(option.value, selected)}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{option.label}</span>
                {selected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                    <Check className="size-3" /> Selecionado
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </Fieldset>

      <CheckboxField
        label="Senti algum desconforto ou dor hoje"
        name="hasPain"
        defaultChecked={defaults?.hasPain}
        onChange={(event) => setHasPain(event.currentTarget.checked)}
      />

      {hasPain ? (
        <VoiceTextArea
          label="Descreva o local e a intensidade do desconforto"
          name="painNote"
          defaultValue={defaults?.painNote}
          hint="Descreva com suas palavras para fins de registro e acompanhamento."
        />
      ) : null}

      <CheckboxField
        label="Consegui cumprir meus cuidados de saúde hoje"
        name="didCare"
        defaultChecked={defaults?.didCare ?? true}
      />

      <VoiceTextArea
        label="Observações gerais do dia"
        name="note"
        defaultValue={defaults?.note}
        hint="Ex.: noite de sono tranquila, boa disposição física, etc."
      />

      <SubmitButton size="lg" icon={<CheckCircle2 className="size-5" />} pendingLabel="Registrando…">
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
        label="Descrição do sintoma observado"
        name="name"
        required
        error={state.errors.name}
        placeholder="Ex.: Dor de cabeça tensional"
      />
      <SelectField
        label="Grau de intensidade"
        name="intensity"
        required
        defaultValue="1"
        options={INTENSITIES.map((item) => ({ value: String(item.value), label: item.label }))}
        hint="Classificação de acompanhamento. Não substitui avaliação profissional."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Data da ocorrência" name="date" type="date" required defaultValue={todayIso()} error={state.errors.date} />
        <TextField label="Horário aproximado" name="time" type="time" required defaultValue={currentTime()} error={state.errors.time} />
      </div>
      <TextField
        label="Duração aproximada (minutos)"
        name="durationMinutes"
        type="number"
        min={0}
        inputMode="numeric"
        error={state.errors.durationMinutes}
        placeholder="Ex.: 30"
      />
      <VoiceTextArea label="Notas e observações sobre o sintoma" name="notes" hint="Você pode ditar por voz se preferir." />
      <SubmitButton size="lg" icon={<FileText className="size-5" />}>
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
          label="Pressão sistólica — Máxima (mmHg)"
          name="systolic"
          type="number"
          inputMode="numeric"
          required
          placeholder="120"
          error={state.errors.systolic}
        />
        <TextField
          label="Pressão diastólica — Mínima (mmHg)"
          name="diastolic"
          type="number"
          inputMode="numeric"
          required
          placeholder="80"
          error={state.errors.diastolic}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Data da medição" name="date" type="date" required defaultValue={todayIso()} error={state.errors.date} />
        <TextField label="Horário" name="time" type="time" required defaultValue={currentTime()} error={state.errors.time} />
      </div>
      <TextField
        label="Contexto ou observações"
        name="notes"
        error={state.errors.notes}
        placeholder="Ex.: aferido em repouso de 10 min, braço esquerdo"
      />
      <SubmitButton icon={<Activity className="size-4" />}>
        Registrar pressão arterial
      </SubmitButton>
    </form>
  );
}

export function GlucoseForm() {
  const [state, action] = useActionState(addGlucoseAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Valor da glicemia capilar (mg/dL)"
        name="value"
        type="number"
        inputMode="numeric"
        required
        placeholder="95"
        error={state.errors.value}
      />
      <SelectField
        label="Contexto da medição"
        name="context"
        defaultValue=""
        options={[
          { value: "", label: "Não especificado" },
          ...GLUCOSE_CONTEXTS.map((item) => ({ value: item, label: item })),
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Data da medição" name="date" type="date" required defaultValue={todayIso()} error={state.errors.date} />
        <TextField label="Horário" name="time" type="time" required defaultValue={currentTime()} error={state.errors.time} />
      </div>
      <TextField label="Observações adicionais" name="notes" error={state.errors.notes} />
      <SubmitButton icon={<Activity className="size-4" />}>
        Registrar glicemia
      </SubmitButton>
    </form>
  );
}

export function HydrationGoalForm({ current }: { current: number }) {
  const [state, action] = useActionState(saveHydrationGoal, idleState);
  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
      <div className="flex-1">
        <TextField
          label="Meta diária de consumo de água (ml)"
          name="hydrationGoalMl"
          type="number"
          inputMode="numeric"
          min={500}
          max={6000}
          step={100}
          defaultValue={current}
          error={state.errors.hydrationGoalMl}
          hint="Estabeleça a meta recomendada pelo seu médico ou nutricionista."
        />
      </div>
      <SubmitButton icon={<Droplets className="size-4" />}>
        Salvar meta
      </SubmitButton>
      <div className="sr-only" aria-live="polite">
        {state.message}
      </div>
    </form>
  );
}
