"use client";

import { useActionState } from "react";

import { TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import { deleteAccountAction } from "@/features/account/actions";
import { idleState } from "@/lib/action-state";

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Sua senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.errors.password}
      />
      <TextField
        label="Escreva a palavra EXCLUIR para confirmar"
        name="confirmation"
        required
        error={state.errors.confirmation}
        placeholder="EXCLUIR"
      />
      <SubmitButton variant="danger" icon="🗑️" pendingLabel="Excluindo…">
        Excluir minha conta e todos os dados
      </SubmitButton>
    </form>
  );
}
