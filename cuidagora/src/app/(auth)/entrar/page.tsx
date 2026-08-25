import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { SignInForm } from "@/features/auth/forms";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Acessar Plataforma — CuidAgora" };

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect("/inicio");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Acessar sua conta
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Informe seus dados de acesso para acompanhar o plano de cuidados.
        </p>
      </div>

      <SignInForm />

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Ainda não tem cadastro?{" "}
          <Link
            href="/criar-conta"
            className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
          >
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </>
  );
}
