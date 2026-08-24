import { describe, expect, it } from "vitest";

import { compare, describeRule, evaluateCareStatus, type GuidelineRule } from "@/lib/care-status";

const attentionRule: GuidelineRule = {
  id: "1",
  level: "attention",
  title: "Pressão acima do combinado",
  instruction: "Repetir a medição em 15 minutos.",
  metric: "systolic",
  comparator: "gte",
  threshold: 150,
  source: "Dra. Fictícia",
};

const urgentRule: GuidelineRule = {
  ...attentionRule,
  id: "2",
  level: "urgent",
  title: "Pressão muito alta",
  instruction: "Procurar atendimento imediatamente.",
  threshold: 180,
};

describe("Semáforo do Cuidado", () => {
  it("fica verde e avisa quando não há orientações cadastradas", () => {
    const status = evaluateCareStatus([], { systolic: 200 });
    expect(status.level).toBe("ok");
    expect(status.hasGuidelines).toBe(false);
    expect(status.description).toContain("ainda não cadastrou orientações");
  });

  it("nunca cria regra própria: valor alto sem regra correspondente segue verde", () => {
    const status = evaluateCareStatus([{ ...attentionRule, metric: "glucose", threshold: 300 }], {
      systolic: 210,
      diastolic: 130,
    });
    expect(status.level).toBe("ok");
    expect(status.triggered).toHaveLength(0);
  });

  it("aciona o amarelo quando a orientação de atenção é atingida", () => {
    const status = evaluateCareStatus([attentionRule, urgentRule], { systolic: 155 });
    expect(status.level).toBe("attention");
    expect(status.triggered).toHaveLength(1);
    expect(status.triggered[0]?.instruction).toBe("Repetir a medição em 15 minutos.");
  });

  it("prioriza o vermelho quando uma orientação urgente é atingida", () => {
    const status = evaluateCareStatus([attentionRule, urgentRule], { systolic: 190 });
    expect(status.level).toBe("urgent");
    expect(status.triggered.map((item) => item.level)).toContain("urgent");
  });

  it("ignora métricas ausentes", () => {
    const status = evaluateCareStatus([attentionRule], {});
    expect(status.level).toBe("ok");
  });

  it("compara corretamente todos os operadores", () => {
    expect(compare(10, "gt", 5)).toBe(true);
    expect(compare(5, "gte", 5)).toBe(true);
    expect(compare(4, "lt", 5)).toBe(true);
    expect(compare(5, "lte", 5)).toBe(true);
    expect(compare(5, "eq", 5)).toBe(false);
  });

  it("descreve a regra em linguagem simples", () => {
    expect(describeRule(attentionRule)).toContain("150");
  });
});

describe("Acessibilidade do semáforo", () => {
  it("nunca comunica o estado apenas pela cor", () => {
    for (const metrics of [{}, { systolic: 155 }, { systolic: 190 }]) {
      const status = evaluateCareStatus([attentionRule, urgentRule], metrics);
      expect(status.icon.length).toBeGreaterThan(0);
      expect(status.word.length).toBeGreaterThan(0);
      expect(status.title.length).toBeGreaterThan(0);
      expect(status.description.length).toBeGreaterThan(0);
    }
  });
});
