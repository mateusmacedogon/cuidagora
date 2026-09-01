import { and, eq, gte, isNull } from "drizzle-orm";

import { db, ensureDbReady } from "@/db";
import { appointmentQuestions, appointments, careTasks } from "@/db/schema";
import {
  countCompletionsBetween,
  listCheckins,
  listGuidelines,
  listMeasurements,
  listMedications,
  listSymptoms,
} from "@/features/care/data";
import { resolveRange, type SummaryRange } from "@/features/summary/range";

export { resolveRange };
export type { SummaryRange };

/**
 * Organiza — sem interpretar — os dados que a própria pessoa registrou,
 * para levar impresso à consulta médica.
 */
export async function buildSummary(userId: string, range: SummaryRange) {
  try {
    await ensureDbReady();
    const [
      medicationList,
      symptomList,
      measurementList,
      checkinList,
      completions,
      activeTasks,
      questionRows,
      appointmentRows,
      guidelines,
    ] = await Promise.all([
      listMedications(userId).catch(() => []),
      listSymptoms(userId, range.fromIso, range.toIso).catch(() => []),
      listMeasurements(userId, null, range.fromIso, range.toIso).catch(() => []),
      listCheckins(userId, range.fromIso, range.toIso).catch(() => []),
      countCompletionsBetween(userId, range.fromIso, range.toIso).catch(() => 0),
      db
        .select({ id: careTasks.id })
        .from(careTasks)
        .where(and(eq(careTasks.userId, userId), isNull(careTasks.archivedAt)))
        .catch(() => []),
      db
        .select()
        .from(appointmentQuestions)
        .where(and(eq(appointmentQuestions.userId, userId), eq(appointmentQuestions.answered, false)))
        .catch(() => []),
      db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.userId, userId),
            isNull(appointments.deletedAt),
            gte(appointments.scheduledAt, new Date()),
          ),
        )
        .catch(() => []),
      listGuidelines(userId, true).catch(() => []),
    ]);

    const days =
      Math.round(
        (new Date(`${range.toIso}T00:00:00Z`).getTime() -
          new Date(`${range.fromIso}T00:00:00Z`).getTime()) /
          86400000,
      ) + 1;

    const expected = (activeTasks?.length || 0) * Math.max(days, 1);
    const adherence = expected > 0 ? Math.round(((completions || 0) / expected) * 100) : null;

    const notes = (checkinList || [])
      .filter((item) => (item?.note || "").trim().length > 0 || (item?.painNote || "").trim().length > 0)
      .map((item) => ({
        date: item.referenceDate,
        text: [item.painNote, item.note].filter(Boolean).join(" · "),
      }));

    return {
      range,
      days,
      medications: medicationList || [],
      symptoms: symptomList || [],
      measurements: {
        bloodPressure: (measurementList || []).filter((item) => item.kind === "blood_pressure"),
        glucose: (measurementList || []).filter((item) => item.kind === "glucose"),
        hydration: (measurementList || []).filter((item) => item.kind === "hydration"),
      },
      checkins: checkinList || [],
      adherence: { completions: completions || 0, expected, percent: adherence },
      questions: questionRows || [],
      upcomingAppointments: appointmentRows || [],
      guidelines: guidelines || [],
      notes,
    };
  } catch (err) {
    console.error("Erro ao compilar resumo:", err);
    return {
      range,
      days: 7,
      medications: [],
      symptoms: [],
      measurements: { bloodPressure: [], glucose: [], hydration: [] },
      checkins: [],
      adherence: { completions: 0, expected: 0, percent: null },
      questions: [],
      upcomingAppointments: [],
      guidelines: [],
      notes: [],
    };
  }
}

export type SummaryData = Awaited<ReturnType<typeof buildSummary>>;
