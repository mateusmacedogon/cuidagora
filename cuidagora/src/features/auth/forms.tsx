"use client";

import Link from "next/link";
import { useActionState } from "react";

import { CheckboxField, SelectField, TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import { idleState } from "@/lib/action-state";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "@/features/auth/actions";

export function SignInForm() {
  const [state, action] = useActionState(signInAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Seu e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        inputMode="email"
        error={state.errors.email}
        placeholder="exemplo@email.com"
      />
      <TextField
        label="Sua senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.errors.password}
      />
      <SubmitButton size="lg" pendingLabel="Entrando…" icon="🔑">
        Entrar
      </SubmitButton>
      <Link href="/recuperar-senha" className="text-center font-semibold underline">
        Esqueci minha senha
      </Link>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Como podemos te chamar?"
        name="name"
        autoComplete="name"
        required
        error={state.errors.name}
        placeholder="Maria Silva"
      />
      <TextField
        label="Seu e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        inputMode="email"
        error={state.errors.email}
        placeholder="exemplo@email.com"
      />
      <SelectField
        label="Você vai usar o CuidAgora para..."
        name="accountType"
        required
        options={[
          { value: "person", label: "Cuidar de mim" },
          { value: "caregiver", label: "Acompanhar outra pessoa" },
        ]}
        hint="Você pode fazer as duas coisas depois."
      />
      <TextField
        label="Crie uma senha"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Use pelo menos 8 caracteres."
        error={state.errors.password}
      />
      <TextField
        label="Repita a senha"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors.confirmPassword}
      />
      <CheckboxField
        label="Concordo em guardar minhas informações de saúde no CuidAgora"
        name="acceptedTerms"
        hint="Você pode apagar sua conta e todos os dados a qualquer momento."
        error={state.errors.acceptedTerms}
      />
      <SubmitButton size="lg" pendingLabel="Criando conta…" icon="✨">
        Criar minha conta
      </SubmitButton>
      <Link href="/entrar" className="text-center font-semibold underline">
        Já tenho conta. Quero entrar
      </Link>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      {state.status === "success" ? (
        <p className="rounded-2xl border-2 border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-4 text-sm break-words">
          {state.message}
        </p>
      ) : null}
      <TextField
        label="Seu e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors.email}
      />
      <SubmitButton size="lg" pendingLabel="Enviando…" icon="✉️">
        Recuperar acesso
      </SubmitButton>
      <Link href="/entrar" className="text-center font-semibold underline">
        Voltar para o login
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <input type="hidden" name="token" value={token} />
      <TextField
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Use pelo menos 8 caracteres."
        error={state.errors.password}
      />
      <TextField
        label="Repita a nova senha"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors.confirmPassword}
      />
      <SubmitButton size="lg" pendingLabel="Salvando…" icon="🔒">
        Salvar nova senha
      </SubmitButton>
      <Link href="/entrar" className="text-center font-semibold underline">
        Ir para o login
      </Link>
    </form>
  );
}
