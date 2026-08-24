import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/features/auth/forms";
import { getSessionUser } from "@/lib/auth/session";
import { Alert } from "@/components/ui/Feedback";

export const metadata: Metadata = { title: "Entrar — CuidAgora" };

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect("/inicio");

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">Entrar no CuidAgora</h1>
      <p className="mb-6 text-[var(--color-ink-soft)]">
        Digite seu e-mail e sua senha para ver os cuidados de hoje.
      </p>
      <SignInForm />
      <div className="mt-6">
        <Alert tone="info" title="Quer só experimentar?">
          Use a conta de demonstração: <strong>maria@exemplo.com</strong> com a senha{" "}
          <strong>cuidagora123</strong>. Todos os dados dela são fictícios.
        </Alert>
      </div>
    </>
  );
}
