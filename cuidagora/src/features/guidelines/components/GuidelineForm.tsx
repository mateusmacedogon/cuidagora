"use client";

import { useActionState } from "react";

import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import { saveGuidelineAction } from "@/features/guidelines/actions";
import { idleState } from "@/lib/action-state";
import { COMPARATORS, GUIDELINE_METRICS } from "@/lib/domain";

export function GuidelineForm() {
  const [state, action] = useActionState(saveGuidelineAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <SelectField
        label="Tipo de sinal"
        name="level"
        required
        defaultValue="attention"
        options={[
          { value: "attention", label: "🟡 Atenção" },
          { value: "urgent", label: "🔴 Buscar atendimento" },
        ]}
      />
      <TextField
        label="Título da orientação"
        name="title"
        required
        error={state.errors.title}
        placeholder="Ex.: Pressão alta"
      />
      <SelectField
        label="Quando o valor de..."
        name="metric"
        required
        defaultValue="systolic"
        options={GUIDELINE_METRICS.map((item) => ({ value: item.value, label: item.label }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="...for"
          name="comparator"
          required
          defaultValue="gte"
          options={COMPARATORS.map((item) => ({ value: item.value, label: item.label }))}
        />
        <TextField
          label="Valor de referência"
          name="threshold"
          type="number"
          step="0.1"
          inputMode="decimal"
          required
          error={state.errors.threshold}
          placeholder="Ex.: 150"
        />
      </div>
      <TextAreaField
        label="O que fazer nesse caso (orientação recebida)"
        name="instruction"
        required
        error={state.errors.instruction}
        hint="Escreva exatamente o que o profissional orientou. O CuidAgora nunca cria orientações."
        placeholder="Ex.: Repetir a medição após 15 minutos em repouso e ligar para a clínica."
      />
      <TextField
        label="Quem passou essa orientação"
        name="source"
        error={state.errors.source}
        placeholder="Ex.: Dra. Ana Fictícia — Cardiologia"
      />
      <SubmitButton size="lg" icon="🧭">
        Cadastrar orientação
      </SubmitButton>
    </form>
  );
}
