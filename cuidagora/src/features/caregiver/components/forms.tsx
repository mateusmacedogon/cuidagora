"use client";

import { useActionState } from "react";

import { TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import {
  inviteCaregiverAction,
  updateCaregiverPermissionsAction,
} from "@/features/caregiver/actions";
import { idleState } from "@/lib/action-state";
import { PERMISSION_KEYS, PERMISSION_LABELS, type PermissionSet } from "@/lib/domain";

function PermissionChecklist({
  permissions,
  idPrefix,
}: {
  permissions?: PermissionSet;
  idPrefix: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-base font-semibold">O que esta pessoa poderá ver</legend>
      <p className="text-sm text-[var(--color-ink-soft)]">
        Marque apenas o necessário. Você pode mudar ou remover o acesso quando quiser.
      </p>
      <ul className="flex flex-col gap-2">
        {PERMISSION_KEYS.map((key) => {
          const id = `${idPrefix}-${key}`;
          return (
            <li key={key} className="flex items-center gap-3 rounded-2xl border-2 border-[var(--color-line)] p-3">
              <input
                type="checkbox"
                id={id}
                name={key}
                defaultChecked={permissions?.[key] ?? false}
                className="h-6 w-6 accent-[var(--color-brand)]"
              />
              <label htmlFor={id} className="font-semibold">
                {PERMISSION_LABELS[key]}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function CaregiverInviteForm() {
  const [state, action] = useActionState(inviteCaregiverAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Nome de quem vai te acompanhar"
        name="caregiverName"
        required
        error={state.errors.caregiverName}
        placeholder="Ex.: João (meu filho)"
      />
      <TextField
        label="E-mail dessa pessoa"
        name="caregiverEmail"
        type="email"
        inputMode="email"
        required
        error={state.errors.caregiverEmail}
        hint="Ela precisa criar uma conta no CuidAgora com este mesmo e-mail."
      />
      <PermissionChecklist idPrefix="novo" />
      <SubmitButton size="lg" icon="🤝">
        Liberar acesso
      </SubmitButton>
    </form>
  );
}

export function CaregiverPermissionsForm({
  accessId,
  permissions,
}: {
  accessId: string;
  permissions: PermissionSet;
}) {
  const [state, action] = useActionState(updateCaregiverPermissionsAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      <FormFeedback state={state} />
      <input type="hidden" name="accessId" value={accessId} />
      <PermissionChecklist idPrefix={accessId} permissions={permissions} />
      <SubmitButton icon="💾">Salvar permissões</SubmitButton>
    </form>
  );
}
