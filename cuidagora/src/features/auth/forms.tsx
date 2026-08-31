"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  HeartHandshake,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Shield,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";

import { CheckboxField, SelectField, TextField } from "@/components/ui/Field";
import { FormFeedback, SubmitButton } from "@/components/ui/SubmitButton";
import { idleState } from "@/lib/action-state";
import {
  demoSignInAction,
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "@/features/auth/actions";

export function DemoSignInButtons() {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDemo = async (role: "maria" | "joao") => {
    try {
      setErrorMsg(null);
      setLoadingRole(role);
      const res = await demoSignInAction(role);
      if (res && res.status === "error") {
        setErrorMsg(res.message);
        setLoadingRole(null);
      }
    } catch (err: any) {
      if (err?.message !== "NEXT_REDIRECT") {
        setErrorMsg("Não foi possível acessar a demonstração agora. Tente novamente.");
        setLoadingRole(null);
      }
    }
  };

  return (
    <div className="space-y-3">
      {errorMsg ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {errorMsg}
        </div>
      ) : null}

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Acesso Rápido de Demonstração
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleDemo("maria")}
          disabled={Boolean(loadingRole)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 hover:border-teal-300 transition-all text-left group cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {loadingRole === "maria" ? "..." : "MA"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Maria (Paciente)</p>
              <p className="text-[11px] text-slate-500">
                {loadingRole === "maria" ? "Entrando..." : "Perfil titular"}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-teal-700 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={() => handleDemo("joao")}
          disabled={Boolean(loadingRole)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-all text-left group cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {loadingRole === "joao" ? "..." : "JF"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">João (Cuidador)</p>
              <p className="text-[11px] text-slate-500">
                {loadingRole === "joao" ? "Entrando..." : "Perfil familiar"}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-700 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export function SignInForm() {
  const [state, action] = useActionState(signInAction, idleState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <FormFeedback state={state} />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          inputMode="email"
          error={state.errors.email}
          placeholder="seu.email@exemplo.com"
          defaultValue="maria@exemplo.com"
        />
        <div className="relative">
          <TextField
            label="Senha"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            error={state.errors.password}
            defaultValue="cuidagora123"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/recuperar-senha"
            className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <SubmitButton
          size="lg"
          pendingLabel="Autenticando…"
          icon={<LogIn className="size-5" />}
        >
          Entrar na plataforma
        </SubmitButton>
      </form>

      <DemoSignInButtons />
    </div>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, idleState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      <TextField
        label="Nome completo"
        name="name"
        autoComplete="name"
        required
        error={state.errors.name}
        placeholder="Maria Silva"
      />
      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        inputMode="email"
        error={state.errors.email}
        placeholder="maria.silva@exemplo.com"
      />
      <SelectField
        label="Finalidade principal de uso"
        name="accountType"
        required
        options={[
          { value: "person", label: "Cuidar da minha própria rotina de saúde" },
          { value: "caregiver", label: "Acompanhar familiares ou pacientes (Cuidador)" },
        ]}
        hint="Você poderá alternar e vincular outros perfis a qualquer momento."
      />
      <div className="relative">
        <TextField
          label="Criar senha de acesso"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          hint="Mínimo de 8 caracteres."
          error={state.errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <TextField
        label="Confirmar senha"
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        required
        error={state.errors.confirmPassword}
      />
      <CheckboxField
        label="Concordo com os termos de privacidade e custódia segura de dados clínicos"
        name="acceptedTerms"
        hint="Conformidade integral com a LGPD. Seus dados são confidenciais e podem ser exportados ou excluídos a qualquer hora."
        error={state.errors.acceptedTerms}
      />
      <SubmitButton
        size="lg"
        pendingLabel="Criando conta…"
        icon={<UserCheck className="size-5" />}
      >
        Finalizar cadastro
      </SubmitButton>
      <div className="text-center pt-2">
        <Link
          href="/entrar"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          Já possui uma conta? Faça login
        </Link>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idleState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormFeedback state={state} />
      {state.status === "success" ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50/90 p-4 text-sm text-teal-900 leading-relaxed shadow-xs">
          <p className="font-bold">Instruções enviadas</p>
          <p className="mt-1 break-words">{state.message}</p>
        </div>
      ) : null}
      <TextField
        label="E-mail cadastrado"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors.email}
        placeholder="seu.email@exemplo.com"
      />
      <SubmitButton
        size="lg"
        pendingLabel="Processando solicitação…"
        icon={<Mail className="size-5" />}
      >
        Enviar link de recuperação
      </SubmitButton>
      <div className="text-center pt-2">
        <Link
          href="/entrar"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          Voltar para a tela de login
        </Link>
      </div>
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
        hint="Utilize no mínimo 8 caracteres."
        error={state.errors.password}
      />
      <TextField
        label="Confirmar nova senha"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors.confirmPassword}
      />
      <SubmitButton
        size="lg"
        pendingLabel="Redefinindo senha…"
        icon={<Lock className="size-5" />}
      >
        Salvar nova senha
      </SubmitButton>
      <div className="text-center pt-2">
        <Link
          href="/entrar"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          Ir para o login
        </Link>
      </div>
    </form>
  );
}
