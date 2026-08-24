import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/features/auth/forms";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Criar conta — CuidAgora" };

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) redirect("/inicio");

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">Criar sua conta</h1>
      <p className="mb-6 text-[var(--color-ink-soft)]">
        São só quatro informações. Nada de dados desnecessários.
      </p>
      <SignUpForm />
    </>
  );
}
