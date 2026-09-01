"use client";

import { useActionState } from "react";
import { Save, ShieldCheck, UserPlus, Users } from "lucide-react";

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
    <fieldset className="flex flex-col gap-2.5">
      <legend className="text-sm sm:text-base font-bold text-slate-900">
        Permissões de visualização granulares
      </legend>
      <p className="text-xs sm:text-sm text-slate-500">
        Marque apenas os módulos que você deseja autorizar. Você pode alterar ou revogar este acesso a qualquer momento.
      </p>
      <ul className="flex flex-col gap-2 pt-1">
        {PERMISSION_KEYS.map((key) => {
          const id = `${idPrefix}-${key}`;
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <input
                type="checkbox"
                id={id}
                name={key}
                defaultChecked={permissions?.[key] ?? false}
                className="size-5 rounded border-slate-300 accent-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor={id} className="text-sm font-semibold text-slate-800 cursor-pointer select-none">
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
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Nome do familiar ou cuidador"
        name="caregiverName"
        required
        error={state.errors.caregiverName}
        placeholder="Ex.: João Silva (Filho)"
      />
      <TextField
        label="E-mail da pessoa autorizada"
        name="caregiverEmail"
        type="email"
        inputMode="email"
        required
        error={state.errors.caregiverEmail}
        hint="Esta pessoa deverá utilizar o mesmo e-mail para acessar os dados compartilhados."
      />
      <PermissionChecklist idPrefix="novo" />
      <SubmitButton size="lg" icon={<UserPlus className="size-5" />}>
        Autorizar e conceder acesso
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
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <input type="hidden" name="accessId" value={accessId} />
      <PermissionChecklist idPrefix={accessId} permissions={permissions} />
      <SubmitButton icon={<Save className="size-4" />}>
        Salvar permissões atualizadas
      </SubmitButton>
    </form>
  );
}
