import { describe, expect, it } from "vitest";

import {
  appointmentQuestionSchema,
  bloodPressureSchema,
  checkinSchema,
  medicationSchema,
  signUpSchema,
  symptomSchema,
} from "@/lib/validation";
import { resolveRange } from "@/features/summary/range";
import { addDaysIso, minutesFromTime, todayIso } from "@/lib/date";

describe("Cadastro de conta", () => {
  const base = {
    name: "Maria",
    email: "MARIA@Exemplo.com ",
    password: "cuidagora123",
    confirmPassword: "cuidagora123",
    acceptedTerms: true,
    accountType: "person",
  };

  it("normaliza o e-mail e aceita dados válidos", () => {
    const parsed = signUpSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("maria@exemplo.com");
  });

  it("recusa senhas diferentes", () => {
    const parsed = signUpSchema.safeParse({ ...base, confirmPassword: "outra-senha" });
    expect(parsed.success).toBe(false);
  });

  it("recusa senha curta", () => {
    const parsed = signUpSchema.safeParse({ ...base, password: "1234", confirmPassword: "1234" });
    expect(parsed.success).toBe(false);
  });

  it("exige consentimento explícito", () => {
    const parsed = signUpSchema.safeParse({ ...base, acceptedTerms: false });
    expect(parsed.success).toBe(false);
  });
});

describe("Cadastro de medicamento", () => {
  it("exige nome e ao menos um horário", () => {
    expect(
      medicationSchema.safeParse({ name: "", startDate: todayIso(), times: [] }).success,
    ).toBe(false);
  });

  it("aceita dose informativa livre digitada pelo usuário", () => {
    const parsed = medicationSchema.safeParse({
      name: "Losartana",
      dose: "1 comprimido de 50 mg",
      startDate: todayIso(),
      times: ["08:00"],
    });
    expect(parsed.success).toBe(true);
  });

  it("recusa horário em formato inválido", () => {
    const parsed = medicationSchema.safeParse({
      name: "Losartana",
      startDate: todayIso(),
      times: ["8h"],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("Check-in e registros do dia", () => {
  it("aceita apenas os quatro estados de humor previstos", () => {
    expect(checkinSchema.safeParse({ mood: "good" }).success).toBe(true);
    expect(checkinSchema.safeParse({ mood: "otimo" }).success).toBe(false);
  });

  it("valida faixas plausíveis de pressão sem interpretar clinicamente", () => {
    const valid = bloodPressureSchema.safeParse({
      systolic: "120",
      diastolic: "80",
      date: todayIso(),
      time: "10:00",
    });
    expect(valid.success).toBe(true);
    expect(
      bloodPressureSchema.safeParse({ systolic: "900", diastolic: "80", date: todayIso(), time: "10:00" })
        .success,
    ).toBe(false);
  });

  it("limita a intensidade do sintoma à escala simples de 1 a 3", () => {
    const base = { name: "Dor de cabeça", date: todayIso(), time: "10:00" };
    expect(symptomSchema.safeParse({ ...base, intensity: 2 }).success).toBe(true);
    expect(symptomSchema.safeParse({ ...base, intensity: 7 }).success).toBe(false);
  });

  it("exige texto na pergunta para a consulta", () => {
    expect(appointmentQuestionSchema.safeParse({ question: "   " }).success).toBe(false);
  });
});

describe("Períodos do resumo para consulta", () => {
  it("resolve os presets de 7, 15 e 30 dias", () => {
    const today = todayIso();
    expect(resolveRange("7").fromIso).toBe(addDaysIso(today, -6));
    expect(resolveRange("15").fromIso).toBe(addDaysIso(today, -14));
    expect(resolveRange("30").fromIso).toBe(addDaysIso(today, -29));
    expect(resolveRange("30").toIso).toBe(today);
  });

  it("aceita período personalizado e corrige a ordem invertida", () => {
    const range = resolveRange("custom", "2026-01-10", "2026-01-01");
    expect(range.fromIso).toBe("2026-01-01");
    expect(range.toIso).toBe("2026-01-10");
  });
});

describe("Utilitários de horário", () => {
  it("ordena horários corretamente", () => {
    expect(minutesFromTime("08:00")).toBeLessThan(minutesFromTime("18:30"));
    expect(minutesFromTime("23:59")).toBe(1439);
  });
});
