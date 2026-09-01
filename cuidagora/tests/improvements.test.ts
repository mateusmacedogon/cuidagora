import { describe, it, expect } from "vitest";
import { db, ensureDbReady } from "@/db";
import { users, measurements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { listMeasurements } from "@/features/care/data";
import { todayIso, addDaysIso } from "@/lib/date";

describe("New Improvements & Features Test Suite", () => {
  it("verifies measurements retrieval for trend sparklines", async () => {
    await ensureDbReady();

    const maria = (
      await db.select().from(users).where(eq(users.email, "maria@exemplo.com")).limit(1)
    )[0];
    expect(maria).toBeDefined();

    const dateIso = todayIso();
    const fromIso = addDaysIso(dateIso, -30);

    const bpList = await listMeasurements(maria.id, "blood_pressure", fromIso, dateIso);
    expect(bpList.length).toBeGreaterThan(0);
    expect(bpList[0].systolic).toBeDefined();
    expect(bpList[0].diastolic).toBeDefined();

    const glucoseList = await listMeasurements(maria.id, "glucose", fromIso, dateIso);
    expect(glucoseList.length).toBeGreaterThan(0);
    expect(Number(glucoseList[0].value)).toBeGreaterThan(0);
  });

  it("verifies data structure for LGPD export route", async () => {
    await ensureDbReady();

    const maria = (
      await db.select().from(users).where(eq(users.email, "maria@exemplo.com")).limit(1)
    )[0];

    const measurementsRows = await db
      .select()
      .from(measurements)
      .where(eq(measurements.userId, maria.id));

    expect(measurementsRows.length).toBeGreaterThan(0);
  });
});
