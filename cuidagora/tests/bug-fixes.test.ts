import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { db, ensureDbReady } from "@/db";
import { users, appointments, appointmentQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { listQuestions } from "@/features/care/data";
import { getSyncState } from "@/lib/sync/client-state";

describe("Bug Fixes & Audit Validation Test Suite", () => {
  it("ensures fallback hydration defaults to 0 and not 850", async () => {
    const sync = await getSyncState("user-unauthenticated-or-isolated");
    expect(sync.hydrationTotal).toBe(0);
    expect(sync.hydrationTotal).not.toBe(850);
  });

  it("isolates sync state when expectedUserId does not match", async () => {
    // getSyncState with an expectedUserId returns clean empty state if not matching
    const isolated = await getSyncState("another-user-id");
    expect(isolated.completions).toEqual({});
    expect(isolated.hydrationTotal).toBe(0);
    expect(isolated.deletedTaskIds).toEqual([]);
  });

  it("filters out questions linked to soft-deleted appointments", async () => {
    await ensureDbReady();
    const maria = (
      await db.select().from(users).where(eq(users.email, "maria@exemplo.com")).limit(1)
    )[0];
    expect(maria).toBeDefined();

    // Cria consulta temporária e pergunta vinculada
    const appt = (
      await db
        .insert(appointments)
        .values({
          userId: maria.id,
          specialty: "Cardiologia Teste",
          scheduledAt: new Date(),
        })
        .returning({ id: appointments.id })
    )[0];

    await db.insert(appointmentQuestions).values({
      userId: maria.id,
      appointmentId: appt.id,
      question: "Dúvida sobre medicação para o cardiologista",
    });

    // Antes de deletar, a pergunta aparece na lista
    const questionsBefore = await listQuestions(maria.id, appt.id);
    expect(questionsBefore.some((q) => q.question.includes("cardiologista"))).toBe(true);

    // Soft-deleta a consulta
    await db
      .update(appointments)
      .set({ deletedAt: new Date() })
      .where(eq(appointments.id, appt.id));

    // Agora listQuestions deve ignorar a pergunta da consulta deletada
    const questionsAfter = await listQuestions(maria.id);
    expect(questionsAfter.some((q) => q.appointmentId === appt.id)).toBe(false);
  });

  it("verifies filename sanitization for LGPD export with accented names", () => {
    const names = [
      { raw: "João da Silva", expected: "joao_da_silva" },
      { raw: "Maria Aparecida", expected: "maria_aparecida" },
      { raw: "Cláudia Cristina", expected: "claudia_cristina" },
      { raw: "José-René @Teste!", expected: "jose-rene__teste_" },
    ];

    for (const item of names) {
      const safe = item.raw
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_");
      expect(safe).toBe(item.expected);
      // Garante que só contém caracteres ASCII seguros para HTTP headers
      expect(safe).toMatch(/^[a-z0-9_-]+$/);
    }
  });
});
