import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Recuperar senha — CuidAgora" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">Esqueceu a senha?</h1>
      <p className="mb-6 text-[var(--color-ink-soft)]">
        Sem problema. Informe o e-mail da sua conta e criaremos um link seguro para você escolher uma
        nova senha.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
