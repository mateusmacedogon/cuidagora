import { addDaysIso, todayIso } from "@/lib/date";

export type SummaryRange = { fromIso: string; toIso: string; label: string };

/** Converte o filtro escolhido pela pessoa em um intervalo de datas. */
export function resolveRange(preset: string, from?: string, to?: string): SummaryRange {
  const today = todayIso();
  if (preset === "custom" && from && to) {
    return {
      fromIso: from <= to ? from : to,
      toIso: from <= to ? to : from,
      label: "Período escolhido",
    };
  }
  const days = preset === "15" ? 15 : preset === "30" ? 30 : 7;
  return {
    fromIso: addDaysIso(today, -(days - 1)),
    toIso: today,
    label: `Últimos ${days} dias`,
  };
}
