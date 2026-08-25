import { describe, it, expect } from "vitest";
import { db, ensureDbReady } from "@/db";
import { users, careTasks, measurements, dailyCheckins, careGuidelines } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { evaluateCareStatus } from "@/lib/care-status";
import { buildCareMetrics, listTasksForDate, listMedications, listAppointments } from "@/features/care/data";
import { buildSummary, resolveRange } from "@/features/summary/data";
import { todayIso } from "@/lib/date";

describe("CuidAgora Full Integration & Clinical Flow", () => {
  it("initializes database, retrieves demo users and evaluates clinical care status", async () => {
    await ensureDbReady();

    // 1. Check Demo Patient (Maria)
    const maria = (
      await db.select().from(users).where(eq(users.email, "maria@exemplo.com")).limit(1)
    )[0];
    expect(maria).toBeDefined();
    expect(maria.name).toContain("Maria");

    // 2. Check Demo Caregiver (João)
    const joao = (
      await db.select().from(users).where(eq(users.email, "joao@exemplo.com")).limit(1)
    )[0];
    expect(joao).toBeDefined();
    expect(joao.name).toContain("João");

    // 3. Check Tasks & Medications
    const tasks = await listTasksForDate(maria.id, todayIso());
    expect(tasks.length).toBeGreaterThan(0);

    const medications = await listMedications(maria.id);
    expect(medications.length).toBeGreaterThanOrEqual(2);

    // 4. Check Clinical Guidelines & Status
    const guidelines = await db
      .select()
      .from(careGuidelines)
      .where(eq(careGuidelines.userId, maria.id));
    expect(guidelines.length).toBeGreaterThanOrEqual(3);

    const metrics = await buildCareMetrics(maria.id, todayIso(), 2000);
    const status = evaluateCareStatus(
      guidelines.map((g) => ({
        id: g.id,
        level: g.level as "attention" | "urgent",
        title: g.title,
        instruction: g.instruction,
        metric: g.metric,
        comparator: g.comparator,
        threshold: Number(g.threshold),
        source: g.source || "",
      })),
      metrics
    );
    expect(status.level).toBeDefined();
    expect(status.title).toBeDefined();

    // 5. Check Consultation Summary Generation
    const range = resolveRange("7");
    const summary = await buildSummary(maria.id, range);
    expect(summary.medications.length).toBeGreaterThan(0);
    expect(summary.adherence).toBeDefined();

    // 6. Check Appointments
    const appointments = await listAppointments(maria.id);
    expect(appointments.length).toBeGreaterThan(0);
    expect(appointments[0].specialty).toContain("Cardiologia");
  });
});
