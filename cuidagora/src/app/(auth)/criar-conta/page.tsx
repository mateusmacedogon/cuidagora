import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/features/auth/forms";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Criar Conta — CuidAgora" };

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) redirect("/inicio");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Criar nova conta
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Preencha os campos abaixo para iniciar a organização dos seus cuidados de saúde.
        </p>
      </div>
      <SignUpForm />
    </>
  );
}
