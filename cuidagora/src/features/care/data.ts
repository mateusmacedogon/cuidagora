import { and, asc, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentQuestions,
  appointments,
  careGuidelines,
  careTasks,
  dailyCheckins,
  measurements,
  medicationSchedules,
  medications,
  symptoms,
  taskCompletions,
} from "@/db/schema";
import { addDaysIso, endOfDay, minutesFromTime, startOfDay, todayIso } from "@/lib/date";
import type { CareMetrics, GuidelineRule } from "@/lib/care-status";

/* ------------------------------- Medicamentos ------------------------------ */

export type MedicationWithTimes = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  notes: string;
  startDate: string;
  endDate: string | null;
  archivedAt: Date | null;
  times: string[];
};

export async function listMedications(
  userId: string,
  options: { includeArchived?: boolean } = {},
): Promise<MedicationWithTimes[]> {
  const conditions = [eq(medications.userId, userId)];
  if (!options.includeArchived) conditions.push(isNull(medications.archivedAt));

  const rows = await db
    .select({
      id: medications.id,
      name: medications.name,
      dose: medications.dose,
      frequency: medications.frequency,
      notes: medications.notes,
      startDate: medications.startDate,
      endDate: medications.endDate,
      archivedAt: medications.archivedAt,
      time: medicationSchedules.timeOfDay,
    })
    .from(medications)
    .leftJoin(medicationSchedules, eq(medicationSchedules.medicationId, medications.id))
    .where(and(...conditions))
    .orderBy(asc(medications.name), asc(medicationSchedules.timeOfDay));

  const byId = new Map<string, MedicationWithTimes>();
  for (const row of rows) {
    const current = byId.get(row.id) ?? { ...row, times: [] as string[] };
    if (row.time) current.times = [...current.times, row.time];
    byId.set(row.id, current);
  }
  return [...byId.values()];
}

export async function getMedication(userId: string, id: string) {
  const list = await listMedications(userId, { includeArchived: true });
  return list.find((item) => item.id === id) ?? null;
}

/* ---------------------------- Cuidados do dia ------------------------------ */

export type TodayTask = {
  id: string;
  title: string;
  description: string;
  kind: string;
  timeOfDay: string;
  medicationId: string | null;
  completedAt: Date | null;
};

export async function listTasksForDate(userId: string, dateIso: string): Promise<TodayTask[]> {
  const rows = await db
    .select({
      id: careTasks.id,
      title: careTasks.title,
      description: careTasks.description,
      kind: careTasks.kind,
      timeOfDay: careTasks.timeOfDay,
      medicationId: careTasks.medicationId,
      completedAt: taskCompletions.completedAt,
    })
    .from(careTasks)
    .leftJoin(
      taskCompletions,
      and(eq(taskCompletions.taskId, careTasks.id), eq(taskCompletions.referenceDate, dateIso)),
    )
    .where(and(eq(careTasks.userId, userId), isNull(careTasks.archivedAt)))
    .orderBy(asc(careTasks.timeOfDay));

  return rows.sort((a, b) => minutesFromTime(a.timeOfDay) - minutesFromTime(b.timeOfDay));
}

export async function countCompletionsBetween(userId: string, fromIso: string, toIso: string) {
  const rows = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(taskCompletions)
    .where(
      and(
        eq(taskCompletions.userId, userId),
        gte(taskCompletions.referenceDate, fromIso),
        lte(taskCompletions.referenceDate, toIso),
      ),
    );
  return rows[0]?.total ?? 0;
}

/* --------------------------------- Check-in -------------------------------- */

export async function getCheckin(userId: string, dateIso: string) {
  const rows = await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, userId), eq(dailyCheckins.referenceDate, dateIso)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listCheckins(userId: string, fromIso: string, toIso: string) {
  return db
    .select()
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.userId, userId),
        gte(dailyCheckins.referenceDate, fromIso),
        lte(dailyCheckins.referenceDate, toIso),
      ),
    )
    .orderBy(desc(dailyCheckins.referenceDate));
}

/** Quantos dias seguidos (a partir de hoje) a pessoa registrou "não estou bem". */
export async function countConsecutiveBadMoodDays(userId: string, dateIso: string) {
  const rows = await listCheckins(userId, addDaysIso(dateIso, -14), dateIso);
  let streak = 0;
  let cursor = dateIso;
  for (let index = 0; index < 15; index += 1) {
    const entry = rows.find((row) => row.referenceDate === cursor);
    if (entry && entry.mood === "bad") {
      streak += 1;
      cursor = addDaysIso(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

/* -------------------------------- Sintomas --------------------------------- */

export async function listSymptoms(userId: string, fromIso: string, toIso: string) {
  return db
    .select()
    .from(symptoms)
    .where(
      and(
        eq(symptoms.userId, userId),
        isNull(symptoms.deletedAt),
        gte(symptoms.occurredAt, startOfDay(fromIso)),
        lte(symptoms.occurredAt, endOfDay(toIso)),
      ),
    )
    .orderBy(desc(symptoms.occurredAt));
}

/* -------------------------------- Medições --------------------------------- */

export async function listMeasurements(
  userId: string,
  kind: string | null,
  fromIso: string,
  toIso: string,
) {
  const conditions = [
    eq(measurements.userId, userId),
    isNull(measurements.deletedAt),
    gte(measurements.measuredAt, startOfDay(fromIso)),
    lte(measurements.measuredAt, endOfDay(toIso)),
  ];
  if (kind) conditions.push(eq(measurements.kind, kind));

  return db
    .select()
    .from(measurements)
    .where(and(...conditions))
    .orderBy(desc(measurements.measuredAt));
}

export async function getHydrationTotal(userId: string, dateIso: string): Promise<number> {
  const rows = await db
    .select({ total: sql<string>`coalesce(sum(${measurements.value}), 0)` })
    .from(measurements)
    .where(
      and(
        eq(measurements.userId, userId),
        eq(measurements.kind, "hydration"),
        isNull(measurements.deletedAt),
        gte(measurements.measuredAt, startOfDay(dateIso)),
        lte(measurements.measuredAt, endOfDay(dateIso)),
      ),
    );
  return Number(rows[0]?.total ?? 0);
}

export async function getLatestMeasurement(userId: string, kind: string, dateIso: string) {
  const rows = await db
    .select()
    .from(measurements)
    .where(
      and(
        eq(measurements.userId, userId),
        eq(measurements.kind, kind),
        isNull(measurements.deletedAt),
        gte(measurements.measuredAt, startOfDay(dateIso)),
        lte(measurements.measuredAt, endOfDay(dateIso)),
      ),
    )
    .orderBy(desc(measurements.measuredAt))
    .limit(1);
  return rows[0] ?? null;
}

/* -------------------------------- Consultas -------------------------------- */

export async function listAppointments(userId: string) {
  return db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), isNull(appointments.deletedAt)))
    .orderBy(asc(appointments.scheduledAt));
}

export async function getNextAppointment(userId: string) {
  const rows = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, userId),
        isNull(appointments.deletedAt),
        gte(appointments.scheduledAt, new Date()),
      ),
    )
    .orderBy(asc(appointments.scheduledAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAppointment(userId: string, id: string) {
  const rows = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), eq(appointments.id, id), isNull(appointments.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listQuestions(userId: string, appointmentId?: string) {
  const conditions = [eq(appointmentQuestions.userId, userId)];
  if (appointmentId) conditions.push(eq(appointmentQuestions.appointmentId, appointmentId));
  return db
    .select()
    .from(appointmentQuestions)
    .where(and(...conditions))
    .orderBy(asc(appointmentQuestions.createdAt));
}

/* ------------------------------- Orientações ------------------------------- */

export async function listGuidelines(userId: string, onlyActive = false): Promise<GuidelineRule[]> {
  const conditions = [eq(careGuidelines.userId, userId)];
  if (onlyActive) conditions.push(eq(careGuidelines.active, true));

  const rows = await db
    .select()
    .from(careGuidelines)
    .where(and(...conditions))
    .orderBy(desc(careGuidelines.level), asc(careGuidelines.title));

  return rows.map((row) => ({
    id: row.id,
    level: row.level === "urgent" ? "urgent" : "attention",
    title: row.title,
    instruction: row.instruction,
    metric: row.metric,
    comparator: row.comparator,
    threshold: Number(row.threshold),
    source: row.source,
  }));
}

/** Coleta os números do dia que serão comparados às orientações cadastradas. */
export async function buildCareMetrics(
  userId: string,
  dateIso: string,
  hydrationGoalMl: number,
): Promise<CareMetrics> {
  const [tasks, bloodPressure, glucose, hydration, todaySymptoms, badDays] = await Promise.all([
    listTasksForDate(userId, dateIso),
    getLatestMeasurement(userId, "blood_pressure", dateIso),
    getLatestMeasurement(userId, "glucose", dateIso),
    getHydrationTotal(userId, dateIso),
    listSymptoms(userId, dateIso, dateIso),
    countConsecutiveBadMoodDays(userId, dateIso),
  ]);

  const metrics: CareMetrics = {
    missed_tasks: tasks.filter((task) => !task.completedAt).length,
    hydration_percent: hydrationGoalMl > 0 ? Math.round((hydration / hydrationGoalMl) * 100) : 0,
    mood_bad_days: badDays,
  };

  if (bloodPressure?.systolic) metrics.systolic = bloodPressure.systolic;
  if (bloodPressure?.diastolic) metrics.diastolic = bloodPressure.diastolic;
  if (glucose?.value) metrics.glucose = Number(glucose.value);
  if (todaySymptoms.length > 0) {
    metrics.symptom_intensity = Math.max(...todaySymptoms.map((item) => item.intensity));
  }

  return metrics;
}

export function today(): string {
  return todayIso();
}
