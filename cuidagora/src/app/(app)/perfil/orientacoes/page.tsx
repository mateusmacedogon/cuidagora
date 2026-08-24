import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert, Badge, EmptyState } from "@/components/ui/Feedback";
import { deleteGuidelineAction, toggleGuidelineAction } from "@/features/guidelines/actions";
import { GuidelineForm } from "@/features/guidelines/components/GuidelineForm";
import { listGuidelines } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { describeRule } from "@/lib/care-status";
import { db } from "@/db";
import { careGuidelines } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Orientações do Semáforo — CuidAgora" };

export default async function GuidelinesPage() {
  const user = await requireUser();
  const [rules, rows] = await Promise.all([
    listGuidelines(user.id),
    db.select({ id: careGuidelines.id, active: careGuidelines.active }).from(careGuidelines).where(eq(careGuidelines.userId, user.id)),
  ]);
  const activeMap = new Map(rows.map((row) => [row.id, row.active]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="🧭"
        title="Orientações do Semáforo do Cuidado"
        description="Cadastre aqui o que o seu profissional de saúde orientou. O CuidAgora só compara os seus registros com estas orientações."
      />

      <Alert tone="warning" title="Muito importante">
        O CuidAgora <strong>não cria regras médicas</strong>. Ele apenas guarda e aplica exatamente o que você
        cadastrar. Nunca invente valores: use somente o que foi orientado por um profissional de saúde.
      </Alert>

      <Card>
        <CardTitle icon="📋" description={`${rules.length} orientação(ões) cadastrada(s)`}>
          Minhas orientações
        </CardTitle>

        {rules.length === 0 ? (
          <EmptyState
            icon="🧭"
            title="Nenhuma orientação cadastrada"
            description="Sem orientações, o semáforo permanece verde e apenas informativo. Cadastre abaixo o que você recebeu na consulta."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {rules.map((rule) => {
              const active = activeMap.get(rule.id) ?? true;
              return (
                <li key={rule.id} className="rounded-2xl border-2 border-[var(--color-line)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        <span aria-hidden="true">{rule.level === "urgent" ? "🔴 " : "🟡 "}</span>
                        {rule.title}
                      </h3>
                      <p className="text-sm text-[var(--color-ink-soft)]">{describeRule(rule)}</p>
                      <p className="mt-1">Orientação: “{rule.instruction}”</p>
                      {rule.source ? (
                        <p className="text-sm text-[var(--color-ink-soft)]">Cadastrada por: {rule.source}</p>
                      ) : null}
                      <p className="mt-2">
                        <Badge tone={active ? "success" : "neutral"} icon={active ? "✔️" : "⏸️"}>
                          {active ? "Ativa no semáforo" : "Pausada"}
                        </Badge>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={toggleGuidelineAction}>
                        <input type="hidden" name="id" value={rule.id} />
                        <input type="hidden" name="active" value={active ? "0" : "1"} />
                        <button type="submit" className="min-h-12 rounded-full border-2 border-[var(--color-line)] px-4 py-2 font-semibold">
                          {active ? "⏸️ Pausar" : "▶️ Ativar"}
                        </button>
                      </form>
                      <form action={deleteGuidelineAction}>
                        <input type="hidden" name="id" value={rule.id} />
                        <button type="submit" className="min-h-12 rounded-full border-2 border-[var(--color-alert)] px-4 py-2 font-semibold text-[var(--color-alert)]">
                          🗑️ Apagar
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle icon="➕">Cadastrar uma orientação recebida</CardTitle>
        <GuidelineForm />
      </Card>

      <p>
        <Link href="/perfil" className="font-semibold underline">
          ← Voltar para o perfil
        </Link>
      </p>
    </div>
  );
}
