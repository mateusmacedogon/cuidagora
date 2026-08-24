import { and, eq, gte, isNull, lte } from "drizzle-orm";

import { db } from "@/db";
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
 * para levar impresso à consulta.
 */
export async function buildSummary(userId: string, range: SummaryRange) {
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
    listMedications(userId),
    listSymptoms(userId, range.fromIso, range.toIso),
    listMeasurements(userId, null, range.fromIso, range.toIso),
    listCheckins(userId, range.fromIso, range.toIso),
    countCompletionsBetween(userId, range.fromIso, range.toIso),
    db
      .select({ id: careTasks.id })
      .from(careTasks)
      .where(and(eq(careTasks.userId, userId), isNull(careTasks.archivedAt))),
    db
      .select()
      .from(appointmentQuestions)
      .where(and(eq(appointmentQuestions.userId, userId), eq(appointmentQuestions.answered, false))),
    db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          isNull(appointments.deletedAt),
          gte(appointments.scheduledAt, new Date()),
        ),
      ),
    listGuidelines(userId, true),
  ]);

  const days =
    Math.round(
      (new Date(`${range.toIso}T00:00:00Z`).getTime() -
        new Date(`${range.fromIso}T00:00:00Z`).getTime()) /
        86400000,
    ) + 1;

  const expected = activeTasks.length * Math.max(days, 1);
  const adherence = expected > 0 ? Math.round((completions / expected) * 100) : null;

  const notes = checkinList
    .filter((item) => item.note.trim().length > 0 || item.painNote.trim().length > 0)
    .map((item) => ({
      date: item.referenceDate,
      text: [item.painNote, item.note].filter(Boolean).join(" · "),
    }));

  return {
    range,
    days,
    medications: medicationList,
    symptoms: symptomList,
    measurements: {
      bloodPressure: measurementList.filter((item) => item.kind === "blood_pressure"),
      glucose: measurementList.filter((item) => item.kind === "glucose"),
      hydration: measurementList.filter((item) => item.kind === "hydration"),
    },
    checkins: checkinList,
    adherence: { completions, expected, percent: adherence },
    questions: questionRows,
    upcomingAppointments: appointmentRows,
    guidelines,
    notes,
  };
}

export type SummaryData = Awaited<ReturnType<typeof buildSummary>>;
