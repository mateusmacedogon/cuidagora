import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Check,
  Pause,
  Play,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";

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

export const metadata: Metadata = { title: "Orientações do Semáforo Clínico — CuidAgora" };

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
        icon={<ShieldCheck className="size-7 text-teal-700" />}
        title="Orientações e Limites do Semáforo"
        description="Parâmetros clínicos cadastrados para disparar alertas preventivos de atenção (amarelo) ou de busca por atendimento (vermelho)."
      />

      <Alert tone="warning" title="Diretriz de Segurança Médica">
        O CuidAgora <strong>não gera prescrições autônomas</strong>. As regras ativas são cadastradas pelo próprio usuário com base nas recomendações do médico assistente.
      </Alert>

      <Card>
        <CardTitle
          icon={<ShieldCheck className="size-5 text-teal-700" />}
          description={`${rules.length} orientação(ões) clínica(s) cadastrada(s)`}
        >
          Orientações Cadastradas
        </CardTitle>

        {rules.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="size-8 text-teal-600" />}
            title="Nenhuma orientação configurada no momento"
            description="Sem orientações cadastradas, o Semáforo permanece em estado informativo estável. Adicione os limites fornecidos pelo seu médico."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {rules.map((rule) => {
              const active = activeMap.get(rule.id) ?? true;
              return (
                <li
                  key={rule.id}
                  className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-base sm:text-lg">
                        {rule.level === "urgent" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertOctagon className="size-3" /> Urgente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="size-3" /> Atenção
                          </span>
                        )}
                        <span>{rule.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{describeRule(rule)}</p>
                      <p className="mt-2 text-sm font-semibold text-teal-900 bg-teal-50/70 p-2.5 rounded-lg border border-teal-200/80">
                        Conduta combinada: “{rule.instruction}”
                      </p>
                      {rule.source ? (
                        <p className="text-xs text-slate-500 mt-1">Origem médica: {rule.source}</p>
                      ) : null}
                      <div className="mt-2.5">
                        <Badge
                          tone={active ? "success" : "neutral"}
                          icon={active ? <Check className="size-3" /> : <Pause className="size-3" />}
                        >
                          {active ? "Monitoramento Ativo" : "Monitoramento Pausado"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={toggleGuidelineAction}>
                        <input type="hidden" name="id" value={rule.id} />
                        <input type="hidden" name="active" value={active ? "0" : "1"} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 min-h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {active ? (
                            <>
                              <Pause className="size-3 text-slate-500" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="size-3 text-emerald-600" />
                              Ativar
                            </>
                          )}
                        </button>
                      </form>
                      <form action={deleteGuidelineAction}>
                        <input type="hidden" name="id" value={rule.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center size-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir regra"
                        >
                          <Trash2 className="size-3.5" />
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
        <CardTitle icon={<Plus className="size-5 text-teal-700" />}>
          Cadastrar nova orientação médica
        </CardTitle>
        <GuidelineForm />
      </Card>

      <div>
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para o perfil
        </Link>
      </div>
    </div>
  );
}
