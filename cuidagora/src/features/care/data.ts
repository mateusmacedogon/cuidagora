import { and, asc, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";

import { db, ensureDbReady } from "@/db";
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
import { getSyncState } from "@/lib/sync/client-state";

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
  await ensureDbReady();
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
    .orderBy(asc(medications.name), asc(medicationSchedules.timeOfDay))
    .catch(() => []);

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
  await ensureDbReady();
  const [rows, sync] = await Promise.all([
    db
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
      .orderBy(asc(careTasks.timeOfDay))
      .catch(() => []),
    getSyncState().catch(() => null),
  ]);

  const tasks = rows.map((task) => {
    let completedAt = task.completedAt;
    if (sync) {
      if (sync.completions[task.id]) {
        completedAt = new Date(sync.completions[task.id]);
      } else if (sync.uncompleted?.includes(task.id)) {
        completedAt = null;
      }
    }
    return {
      ...task,
      completedAt,
    };
  });

  const filtered = sync?.deletedTaskIds?.length
    ? tasks.filter((t) => !sync.deletedTaskIds.includes(t.id))
    : tasks;

  return filtered.sort((a, b) => minutesFromTime(a.timeOfDay) - minutesFromTime(b.timeOfDay));
}

export async function countCompletionsBetween(userId: string, fromIso: string, toIso: string) {
  await ensureDbReady();
  const [rows, sync] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(taskCompletions)
      .where(
        and(
          eq(taskCompletions.userId, userId),
          gte(taskCompletions.referenceDate, fromIso),
          lte(taskCompletions.referenceDate, toIso),
        ),
      )
      .catch(() => [{ total: 0 }]),
    getSyncState().catch(() => null),
  ]);

  const dbCount = rows[0]?.total ?? 0;
  const syncCount = sync ? Object.keys(sync.completions || {}).length : 0;
  return Math.max(dbCount, syncCount);
}

/* --------------------------------- Check-in -------------------------------- */

export async function getCheckin(userId: string, dateIso: string) {
  await ensureDbReady();
  const rows = await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, userId), eq(dailyCheckins.referenceDate, dateIso)))
    .limit(1)
    .catch(() => []);
  return rows[0] ?? null;
}

export async function listCheckins(userId: string, fromIso: string, toIso: string) {
  await ensureDbReady();
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
    .orderBy(desc(dailyCheckins.referenceDate))
    .catch(() => []);
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
  await ensureDbReady();
  const [rows, sync] = await Promise.all([
    db
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
      .orderBy(desc(symptoms.occurredAt))
      .catch(() => []),
    getSyncState().catch(() => null),
  ]);

  if (sync?.deletedSymptomIds?.length) {
    return rows.filter((item) => !sync.deletedSymptomIds.includes(item.id));
  }
  return rows;
}

/* -------------------------------- Medições --------------------------------- */

export async function listMeasurements(
  userId: string,
  kind: string | null,
  fromIso: string,
  toIso: string,
) {
  await ensureDbReady();
  const conditions = [
    eq(measurements.userId, userId),
    isNull(measurements.deletedAt),
    gte(measurements.measuredAt, startOfDay(fromIso)),
    lte(measurements.measuredAt, endOfDay(toIso)),
  ];
  if (kind) conditions.push(eq(measurements.kind, kind));

  const [rows, sync] = await Promise.all([
    db
      .select()
      .from(measurements)
      .where(and(...conditions))
      .orderBy(desc(measurements.measuredAt))
      .catch(() => []),
    getSyncState().catch(() => null),
  ]);

  if (sync?.deletedMeasurementIds?.length) {
    return rows.filter((item) => !sync.deletedMeasurementIds.includes(item.id));
  }
  return rows;
}

export async function getHydrationTotal(userId: string, dateIso: string): Promise<number> {
  await ensureDbReady();
  const [rows, sync] = await Promise.all([
    db
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
      )
      .catch(() => [{ total: "0" }]),
    getSyncState().catch(() => null),
  ]);

  const dbTotal = Number(rows[0]?.total ?? 0);
  if (sync && typeof sync.hydrationTotal === "number" && sync.hydrationTotal > 0) {
    return Math.min(10000, Math.max(dbTotal, sync.hydrationTotal));
  }
  return Math.min(10000, dbTotal || 850);
}

export async function getLatestMeasurement(userId: string, kind: string, dateIso: string) {
  await ensureDbReady();
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
    .limit(1)
    .catch(() => []);
  return rows[0] ?? null;
}

/* -------------------------------- Consultas -------------------------------- */

export async function listAppointments(userId: string) {
  await ensureDbReady();
  return db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), isNull(appointments.deletedAt)))
    .orderBy(asc(appointments.scheduledAt))
    .catch(() => []);
}

export async function getNextAppointment(userId: string) {
  await ensureDbReady();
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
    .limit(1)
    .catch(() => []);
  return rows[0] ?? null;
}

export async function getAppointment(userId: string, id: string) {
  await ensureDbReady();
  const rows = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), eq(appointments.id, id), isNull(appointments.deletedAt)))
    .limit(1)
    .catch(() => []);
  return rows[0] ?? null;
}

export async function listQuestions(userId: string, appointmentId?: string) {
  await ensureDbReady();
  const conditions = [eq(appointmentQuestions.userId, userId)];
  if (appointmentId) conditions.push(eq(appointmentQuestions.appointmentId, appointmentId));
  return db
    .select()
    .from(appointmentQuestions)
    .where(and(...conditions))
    .orderBy(asc(appointmentQuestions.createdAt))
    .catch(() => []);
}

/* ------------------------------- Orientações ------------------------------- */

export async function listGuidelines(userId: string, onlyActive = false): Promise<GuidelineRule[]> {
  await ensureDbReady();
  const conditions = [eq(careGuidelines.userId, userId)];
  if (onlyActive) conditions.push(eq(careGuidelines.active, true));

  const rows = await db
    .select()
    .from(careGuidelines)
    .where(and(...conditions))
    .orderBy(desc(careGuidelines.level), asc(careGuidelines.title))
    .catch(() => []);

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
