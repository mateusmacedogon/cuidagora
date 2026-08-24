import { comparatorLabel, guidelineMetricMeta } from "@/lib/domain";

/**
 * SEMÁFORO DO CUIDADO
 * ------------------------------------------------------------------
 * Este módulo NÃO contém conhecimento médico. Ele apenas compara os
 * números registrados pelo usuário com as ORIENTAÇÕES QUE ELE MESMO
 * (ou um profissional autorizado) cadastrou previamente.
 * Sem orientações cadastradas, o semáforo permanece informativo.
 */

export type CareLevel = "ok" | "attention" | "urgent";

export type GuidelineRule = {
  id: string;
  level: "attention" | "urgent";
  title: string;
  instruction: string;
  metric: string;
  comparator: string;
  threshold: number;
  source: string;
};

export type CareMetrics = Partial<{
  systolic: number;
  diastolic: number;
  glucose: number;
  missed_tasks: number;
  mood_bad_days: number;
  symptom_intensity: number;
  hydration_percent: number;
}>;

export type TriggeredGuideline = GuidelineRule & { observed: number };

export type CareStatus = {
  level: CareLevel;
  icon: string;
  word: string;
  title: string;
  description: string;
  triggered: TriggeredGuideline[];
  hasGuidelines: boolean;
};

export function compare(value: number, comparator: string, threshold: number): boolean {
  switch (comparator) {
    case "gt":
      return value > threshold;
    case "gte":
      return value >= threshold;
    case "lt":
      return value < threshold;
    case "lte":
      return value <= threshold;
    default:
      return false;
  }
}

export function describeRule(rule: GuidelineRule): string {
  const meta = guidelineMetricMeta(rule.metric);
  return `Quando ${meta.label.toLowerCase()} ${comparatorLabel(rule.comparator)} ${rule.threshold} ${meta.unit}`;
}

const PRESENTATION: Record<CareLevel, { icon: string; word: string; title: string }> = {
  ok: { icon: "🟢", word: "Verde", title: "Tudo dentro da sua rotina" },
  attention: { icon: "🟡", word: "Amarelo", title: "Atenção: veja a orientação cadastrada" },
  urgent: { icon: "🔴", word: "Vermelho", title: "Siga a orientação cadastrada para buscar atendimento" },
};

export function evaluateCareStatus(rules: GuidelineRule[], metrics: CareMetrics): CareStatus {
  const activeRules = rules.filter((rule) => Number.isFinite(rule.threshold));
  const triggered: TriggeredGuideline[] = [];

  for (const rule of activeRules) {
    const observed = metrics[rule.metric as keyof CareMetrics];
    if (typeof observed !== "number" || Number.isNaN(observed)) continue;
    if (compare(observed, rule.comparator, rule.threshold)) {
      triggered.push({ ...rule, observed });
    }
  }

  const level: CareLevel = triggered.some((item) => item.level === "urgent")
    ? "urgent"
    : triggered.length > 0
      ? "attention"
      : "ok";

  const presentation = PRESENTATION[level];
  const hasGuidelines = activeRules.length > 0;

  const description =
    level === "ok"
      ? hasGuidelines
        ? "Nenhuma das orientações que você cadastrou foi acionada com os registros de hoje."
        : "Você ainda não cadastrou orientações. Cadastre as orientações recebidas do seu profissional de saúde para que o semáforo funcione."
      : level === "attention"
        ? "Um ou mais registros de hoje acionaram orientações de atenção que você cadastrou."
        : "Um ou mais registros de hoje acionaram orientações urgentes que você cadastrou. Siga exatamente o que está escrito abaixo.";

  return { level, ...presentation, description, triggered, hasGuidelines };
}
