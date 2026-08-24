import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/forms";
import { Alert } from "@/components/ui/Feedback";

export const metadata: Metadata = { title: "Nova senha — CuidAgora" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold">Link inválido</h1>
        <Alert tone="warning" title="Este link não está completo">
          Peça um novo link na página “Esqueci minha senha”.
        </Alert>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">Escolher nova senha</h1>
      <p className="mb-6 text-[var(--color-ink-soft)]">Digite a nova senha duas vezes.</p>
      <ResetPasswordForm token={token} />
    </>
  );
}
