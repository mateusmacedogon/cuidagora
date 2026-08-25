"use client";

import { useActionState } from "react";
import { Save, ShieldAlert, ShieldCheck } from "lucide-react";

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
        label="Nível de alerta do semáforo"
        name="level"
        required
        defaultValue="attention"
        options={[
          { value: "attention", label: "Sinal Amarelo — Atenção / Reavaliação Preventiva" },
          { value: "urgent", label: "Sinal Vermelho — Urgência / Buscar Atendimento" },
        ]}
      />
      <TextField
        label="Título da condição clínica"
        name="title"
        required
        error={state.errors.title}
        placeholder="Ex.: Pressão arterial sistólica elevada"
      />
      <SelectField
        label="Parâmetro monitorado"
        name="metric"
        required
        defaultValue="systolic"
        options={GUIDELINE_METRICS.map((item) => ({ value: item.value, label: item.label }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Operador de comparação"
          name="comparator"
          required
          defaultValue="gte"
          options={COMPARATORS.map((item) => ({ value: item.value, label: item.label }))}
        />
        <TextField
          label="Valor limite de disparo"
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
        label="Conduta médica prescrita (orientação)"
        name="instruction"
        required
        error={state.errors.instruction}
        hint="Descreva o procedimento fornecido pelo seu profissional de saúde."
        placeholder="Ex.: Repousar 15 minutos em ambiente calmo e repetir a medição. Se persistir, contatar o consultório."
      />
      <TextField
        label="Profissional ou plano de origem"
        name="source"
        error={state.errors.source}
        placeholder="Ex.: Dra. Ana Fictícia — Cardiologia"
      />
      <SubmitButton size="lg" icon={<ShieldCheck className="size-5" />}>
        Cadastrar orientação clínica
      </SubmitButton>
    </form>
  );
}
