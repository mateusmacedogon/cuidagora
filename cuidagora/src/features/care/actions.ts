"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  careTasks,
  dailyCheckins,
  measurements,
  medicationSchedules,
  medications,
  symptoms,
  taskCompletions,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { addTimelineEvent } from "@/features/timeline/service";
import {
  errorState,
  formToObject,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-state";
import {
  bloodPressureSchema,
  careTaskSchema,
  checkinSchema,
  glucoseSchema,
  hydrationSchema,
  medicationSchema,
  symptomSchema,
} from "@/lib/validation";
import { MOOD_LABELS, intensityLabel, measurementMeta, type MoodValue } from "@/lib/domain";
import { formatTime, todayIso, toInstant } from "@/lib/date";

function refreshCareViews() {
  revalidatePath("/inicio");
  revalidatePath("/cuidados");
  revalidatePath("/cuidados/medicamentos");
  revalidatePath("/cuidados/medicoes");
  revalidatePath("/cuidados/sintomas");
  revalidatePath("/cuidados/check-in");
  revalidatePath("/historico");
  revalidatePath("/resumo");
}

/* ------------------------------ Medicamentos ------------------------------- */

export async function saveMedicationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(formData);
  const times = formData.getAll("times[]").map(String).filter(Boolean);

  const parsed = medicationSchema.safeParse({
    ...raw,
    times,
    createTasks: formData.get("createTasks") === "on",
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  const endDate = data.endDate ? data.endDate : null;

  try {
    if (data.id) {
      const owned = await db
        .select({ id: medications.id })
        .from(medications)
        .where(and(eq(medications.id, data.id), eq(medications.userId, user.id)))
        .limit(1);
      if (owned.length === 0) return errorState("Medicamento não encontrado.");

      await db
        .update(medications)
        .set({
          name: data.name,
          dose: data.dose,
          frequency: data.frequency,
          notes: data.notes,
          startDate: data.startDate,
          endDate,
          updatedAt: new Date(),
        })
        .where(eq(medications.id, data.id));

      await db.delete(medicationSchedules).where(eq(medicationSchedules.medicationId, data.id));
      await db
        .insert(medicationSchedules)
        .values(data.times.map((time) => ({ medicationId: data.id as string, timeOfDay: time })));

      refreshCareViews();
      return successState("Medicamento atualizado.");
    }

    const inserted = await db
      .insert(medications)
      .values({
        userId: user.id,
        name: data.name,
        dose: data.dose,
        frequency: data.frequency,
        notes: data.notes,
        startDate: data.startDate,
        endDate,
      })
      .returning({ id: medications.id });

    const medicationId = inserted[0]?.id;
    if (!medicationId) return errorState("Não foi possível salvar agora.");

    await db
      .insert(medicationSchedules)
      .values(data.times.map((time) => ({ medicationId, timeOfDay: time })));

    if (data.createTasks) {
      await db.insert(careTasks).values(
        data.times.map((time) => ({
          userId: user.id,
          title: `Tomar ${data.name}`,
          description: data.dose ? `Dose registrada por você: ${data.dose}` : "",
          kind: "medication",
          timeOfDay: time,
          medicationId,
        })),
      );
    }

    await addTimelineEvent({
      userId: user.id,
      category: "medication",
      title: `Medicamento cadastrado: ${data.name}`,
      description: [data.dose, data.times.join(", ")].filter(Boolean).join(" · "),
      occurredAt: new Date(),
      referenceId: medicationId,
    });

    refreshCareViews();
    return successState("Medicamento cadastrado e adicionado aos cuidados do dia.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function archiveMedicationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const restore = formData.get("restore") === "1";
  if (!id) return;

  await db
    .update(medications)
    .set({ archivedAt: restore ? null : new Date(), updatedAt: new Date() })
    .where(and(eq(medications.id, id), eq(medications.userId, user.id)));

  await db
    .update(careTasks)
    .set({ archivedAt: restore ? null : new Date(), updatedAt: new Date() })
    .where(and(eq(careTasks.medicationId, id), eq(careTasks.userId, user.id)));

  refreshCareViews();
}

/* ------------------------------ Cuidados/tarefas --------------------------- */

export async function saveTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = careTaskSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  try {
    if (data.id) {
      await db
        .update(careTasks)
        .set({
          title: data.title,
          description: data.description,
          kind: data.kind,
          timeOfDay: data.timeOfDay,
          updatedAt: new Date(),
        })
        .where(and(eq(careTasks.id, data.id), eq(careTasks.userId, user.id)));
      refreshCareViews();
      return successState("Cuidado atualizado.");
    }

    await db.insert(careTasks).values({
      userId: user.id,
      title: data.title,
      description: data.description,
      kind: data.kind,
      timeOfDay: data.timeOfDay,
    });
    refreshCareViews();
    return successState("Cuidado adicionado à sua rotina.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const done = formData.get("done") === "1";
  const referenceDate = String(formData.get("date") ?? todayIso());
  if (!taskId) return;

  const owned = await db
    .select({ id: careTasks.id, title: careTasks.title })
    .from(careTasks)
    .where(and(eq(careTasks.id, taskId), eq(careTasks.userId, user.id)))
    .limit(1);
  const task = owned[0];
  if (!task) return;

  if (done) {
    const now = new Date();
    await db
      .insert(taskCompletions)
      .values({ taskId, userId: user.id, referenceDate, completedAt: now })
      .onConflictDoNothing();
    await addTimelineEvent({
      userId: user.id,
      category: "task",
      title: `Cuidado concluído: ${task.title}`,
      description: `Registrado às ${formatTime(now)}`,
      occurredAt: now,
      referenceId: taskId,
    });
  } else {
    await db
      .delete(taskCompletions)
      .where(and(eq(taskCompletions.taskId, taskId), eq(taskCompletions.referenceDate, referenceDate)));
  }

  refreshCareViews();
}

export async function archiveTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .update(careTasks)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(careTasks.id, id), eq(careTasks.userId, user.id)));
  refreshCareViews();
}

/* --------------------------------- Check-in -------------------------------- */

export async function saveCheckinAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = checkinSchema.safeParse({
    ...formToObject(formData),
    hasPain: formData.get("hasPain") === "on",
    didCare: formData.get("didCare") === "on",
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  const referenceDate = todayIso();

  try {
    await db
      .insert(dailyCheckins)
      .values({ userId: user.id, referenceDate, ...data })
      .onConflictDoUpdate({
        target: [dailyCheckins.userId, dailyCheckins.referenceDate],
        set: { ...data, updatedAt: new Date() },
      });

    await addTimelineEvent({
      userId: user.id,
      category: "checkin",
      title: `Check-in do dia: ${MOOD_LABELS[data.mood as MoodValue]}`,
      description: [data.hasPain ? `Com dor: ${data.painNote || "sem detalhes"}` : "Sem dor relatada", data.note]
        .filter(Boolean)
        .join(" · "),
      occurredAt: new Date(),
    });

    refreshCareViews();
    return successState("Check-in registrado. Obrigado por contar como você está!");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

/* -------------------------------- Sintomas --------------------------------- */

export async function addSymptomAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(formData);
  const parsed = symptomSchema.safeParse({
    ...raw,
    durationMinutes: raw.durationMinutes === "" ? undefined : raw.durationMinutes,
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  const occurredAt = toInstant(data.date, data.time);

  try {
    const inserted = await db
      .insert(symptoms)
      .values({
        userId: user.id,
        name: data.name,
        intensity: data.intensity,
        occurredAt,
        durationMinutes: data.durationMinutes ?? null,
        notes: data.notes,
      })
      .returning({ id: symptoms.id });

    await addTimelineEvent({
      userId: user.id,
      category: "symptom",
      title: `Sintoma: ${data.name}`,
      description: `Intensidade ${intensityLabel(data.intensity)}${data.notes ? ` · ${data.notes}` : ""}`,
      occurredAt,
      referenceId: inserted[0]?.id,
    });

    refreshCareViews();
    return successState("Sintoma registrado no seu histórico.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function deleteSymptomAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .update(symptoms)
    .set({ deletedAt: new Date() })
    .where(and(eq(symptoms.id, id), eq(symptoms.userId, user.id)));
  refreshCareViews();
}

/* -------------------------------- Medições --------------------------------- */

export async function addBloodPressureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = bloodPressureSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  const measuredAt = toInstant(data.date, data.time);

  try {
    await db.insert(measurements).values({
      userId: user.id,
      kind: "blood_pressure",
      systolic: data.systolic,
      diastolic: data.diastolic,
      unit: "mmHg",
      notes: data.notes,
      measuredAt,
    });
    await addTimelineEvent({
      userId: user.id,
      category: "measurement",
      title: `Pressão arterial: ${data.systolic} por ${data.diastolic} mmHg`,
      description: data.notes,
      occurredAt: measuredAt,
    });
    refreshCareViews();
    return successState("Pressão registrada.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function addGlucoseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = glucoseSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  const measuredAt = toInstant(data.date, data.time);

  try {
    await db.insert(measurements).values({
      userId: user.id,
      kind: "glucose",
      value: String(data.value),
      unit: "mg/dL",
      context: data.context,
      notes: data.notes,
      measuredAt,
    });
    await addTimelineEvent({
      userId: user.id,
      category: "measurement",
      title: `Glicemia: ${data.value} mg/dL`,
      description: [data.context, data.notes].filter(Boolean).join(" · "),
      occurredAt: measuredAt,
    });
    refreshCareViews();
    return successState("Glicemia registrada.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function addHydrationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = hydrationSchema.safeParse({ amountMl: formData.get("amountMl") });
  if (!parsed.success) return;

  const now = new Date();
  await db.insert(measurements).values({
    userId: user.id,
    kind: "hydration",
    value: String(parsed.data.amountMl),
    unit: "ml",
    measuredAt: now,
  });
  await addTimelineEvent({
    userId: user.id,
    category: "measurement",
    title: `Água: ${parsed.data.amountMl} ml`,
    occurredAt: now,
  });
  refreshCareViews();
}

export async function deleteMeasurementAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  if (!id) return;
  await db
    .update(measurements)
    .set({ deletedAt: new Date() })
    .where(and(eq(measurements.id, id), eq(measurements.userId, user.id)));
  void measurementMeta(kind);
  refreshCareViews();
}
