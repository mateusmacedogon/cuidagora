"use client";

import { useOptimistic, useTransition } from "react";
import { Droplets, Plus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Alert, ProgressBar } from "@/components/ui/Feedback";
import { addHydrationAction } from "@/features/care/actions";

const QUICK_AMOUNTS = [200, 300, 500];

export function OptimisticHydration({
  totalMl,
  goalMl,
  readOnly = false,
}: {
  totalMl: number;
  goalMl: number;
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTotal, addOptimisticTotal] = useOptimistic(
    totalMl,
    (current: number, added: number) => current + added,
  );

  const reached = optimisticTotal >= goalMl;

  const handleQuickAdd = (amount: number, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      addOptimisticTotal(amount);
      const fd = new FormData();
      fd.set("amountMl", String(amount));
      await addHydrationAction(fd);
    });
  };

  return (
    <Card>
      <CardTitle
        icon={<Droplets className="size-5 text-cyan-700" />}
        description={`Meta diária programada: ${goalMl} ml`}
      >
        Controle de Hidratação
      </CardTitle>
      <div className="mb-3">
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
          {optimisticTotal}{" "}
          <span className="text-sm sm:text-base font-normal text-slate-500">ml ingeridos hoje</span>
        </p>
      </div>
      <ProgressBar value={optimisticTotal} max={goalMl} label="Progresso da meta" />
      {reached ? (
        <div className="mt-3">
          <Alert tone="success" title="Meta de hidratação atingida">
            Excelente! Você alcançou o volume de água estabelecido para o seu dia.
          </Alert>
        </div>
      ) : null}
      {readOnly ? null : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Adicionar rápido:</span>
          {QUICK_AMOUNTS.map((amount) => (
            <form key={amount} onSubmit={(e) => handleQuickAdd(amount, e)} action={addHydrationAction}>
              <input type="hidden" name="amountMl" value={amount} />
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1 min-h-9 rounded-lg border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100/80 transition-colors shadow-2xs cursor-pointer disabled:opacity-75"
              >
                <Plus className="size-3" /> {amount} ml
              </button>
            </form>
          ))}
        </div>
      )}
    </Card>
  );
}
