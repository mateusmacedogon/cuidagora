"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

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
        label="Digite sua senha atual"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.errors.password}
      />
      <TextField
        label="Digite a palavra EXCLUIR para confirmar a exclusão irreversível"
        name="confirmation"
        required
        error={state.errors.confirmation}
        placeholder="EXCLUIR"
      />
      <SubmitButton variant="danger" icon={<Trash2 className="size-4" />} pendingLabel="Excluindo…">
        Excluir minha conta e todos os dados
      </SubmitButton>
    </form>
  );
}
