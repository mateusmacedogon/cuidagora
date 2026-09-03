"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db, ensureDbReady } from "@/db";
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
import { getSyncState, saveSyncState } from "@/lib/sync/client-state";

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
  await ensureDbReady();
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
  const uniqueTimes = Array.from(new Set(data.times));

  try {
    if (data.id) {
      const updated = await db
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
        .where(and(eq(medications.id, data.id), eq(medications.userId, user.id)))
        .returning({ id: medications.id });

      if (updated.length === 0) {
        return errorState("Medicamento não encontrado.");
      }

      await db.delete(medicationSchedules).where(eq(medicationSchedules.medicationId, data.id));
      await db
        .insert(medicationSchedules)
        .values(uniqueTimes.map((time) => ({ medicationId: data.id as string, timeOfDay: time })));

      // Reconcilia tarefas sem apagar registros anteriores (evita ON DELETE CASCADE em taskCompletions)
      const existingTasks = await db
        .select()
        .from(careTasks)
        .where(and(eq(careTasks.medicationId, data.id), eq(careTasks.userId, user.id)));

      if (data.createTasks) {
        const existingByTime = new Map(existingTasks.map((t) => [t.timeOfDay, t]));

        for (const time of uniqueTimes) {
          const existing = existingByTime.get(time);
          if (existing) {
            await db
              .update(careTasks)
              .set({
                title: `Tomar ${data.name}`,
                description: data.dose ? `Dose prescrita: ${data.dose}` : "",
                archivedAt: null,
                updatedAt: new Date(),
              })
              .where(eq(careTasks.id, existing.id));
          } else {
            await db.insert(careTasks).values({
              userId: user.id,
              title: `Tomar ${data.name}`,
              description: data.dose ? `Dose prescrita: ${data.dose}` : "",
              kind: "medication",
              timeOfDay: time,
              medicationId: data.id,
            });
          }
        }

        const removedTasks = existingTasks.filter((t) => !uniqueTimes.includes(t.timeOfDay) && !t.archivedAt);
        for (const removed of removedTasks) {
          await db
            .update(careTasks)
            .set({ archivedAt: new Date(), updatedAt: new Date() })
            .where(eq(careTasks.id, removed.id));
        }
      } else {
        for (const task of existingTasks) {
          if (!task.archivedAt) {
            await db
              .update(careTasks)
              .set({ archivedAt: new Date(), updatedAt: new Date() })
              .where(eq(careTasks.id, task.id));
          }
        }
      }

      refreshCareViews();
      return successState("Medicamento atualizado com sucesso.");
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
      .values(uniqueTimes.map((time) => ({ medicationId, timeOfDay: time })));

    if (data.createTasks) {
      await db.insert(careTasks).values(
        uniqueTimes.map((time) => ({
          userId: user.id,
          title: `Tomar ${data.name}`,
          description: data.dose ? `Dose prescrita: ${data.dose}` : "",
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
      description: [data.dose, uniqueTimes.join(", ")].filter(Boolean).join(" · "),
      occurredAt: new Date(),
      referenceId: medicationId,
    });

    refreshCareViews();
    return successState("Medicamento cadastrado e adicionado aos cuidados do dia.");
  } catch (err) {
    console.error("Erro ao salvar medicamento:", err);
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function archiveMedicationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await ensureDbReady();
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
  await ensureDbReady();
  const parsed = careTaskSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  try {
    if (data.id) {
      const updated = await db
        .update(careTasks)
        .set({
          title: data.title,
          description: data.description,
          kind: data.kind,
          timeOfDay: data.timeOfDay,
          updatedAt: new Date(),
        })
        .where(and(eq(careTasks.id, data.id), eq(careTasks.userId, user.id)))
        .returning({ id: careTasks.id });

      if (updated.length === 0) {
        return errorState("Cuidado não encontrado.");
      }

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
  } catch (err) {
    console.error("Erro ao salvar cuidado:", err);
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await ensureDbReady();
  const taskId = String(formData.get("taskId") ?? "");
  const done = formData.get("done") === "1";
  const referenceDate = String(formData.get("date") ?? todayIso());
  if (!taskId) return;

  // 1. Sincroniza estado imediato (funciona através de todos os lambdas serverless)
  const sync = await getSyncState(user.id);
  sync.userId = user.id;
  if (done) {
    sync.completions[taskId] = new Date().toISOString();
    sync.uncompleted = (sync.uncompleted || []).filter((id) => id !== taskId);
  } else {
    delete sync.completions[taskId];
    if (!sync.uncompleted.includes(taskId)) {
      sync.uncompleted.push(taskId);
    }
  }
  await saveSyncState(sync);

  if (done) {
    // 2. Persiste no banco de dados com validação de ownership
    const owned = await db
      .select({ id: careTasks.id, title: careTasks.title })
      .from(careTasks)
      .where(and(eq(careTasks.id, taskId), eq(careTasks.userId, user.id)))
      .limit(1)
      .catch(() => []);
    const task = owned[0];

    if (task) {
      const now = new Date();
      await db
        .insert(taskCompletions)
        .values({ taskId, userId: user.id, referenceDate, completedAt: now })
        .onConflictDoNothing()
        .catch(() => {});

      await addTimelineEvent({
        userId: user.id,
        category: "task",
        title: `Cuidado concluído: ${task.title}`,
        description: `Registrado às ${formatTime(now)}`,
        occurredAt: now,
        referenceId: taskId,
      }).catch(() => {});
    }
  } else {
    // 3. Exclusão direta no banco sem leitura prévia
    await db
      .delete(taskCompletions)
      .where(
        and(
          eq(taskCompletions.taskId, taskId),
          eq(taskCompletions.userId, user.id),
          eq(taskCompletions.referenceDate, referenceDate),
        ),
      )
      .catch(() => {});
  }

  refreshCareViews();
}

export async function archiveTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await ensureDbReady();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // 1. Sincroniza estado excluído
  const sync = await getSyncState(user.id);
  sync.userId = user.id;
  if (!sync.deletedTaskIds.includes(id)) {
    sync.deletedTaskIds.push(id);
    delete sync.completions[id];
    await saveSyncState(sync);
  }

  // 2. Soft-delete no banco (marcando archivedAt)
  await db
    .update(careTasks)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(careTasks.id, id), eq(careTasks.userId, user.id)))
    .catch(() => {});

  refreshCareViews();
}

/* --------------------------------- Check-in -------------------------------- */

export async function saveCheckinAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  await ensureDbReady();
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
  } catch (err) {
    console.error("Erro ao salvar check-in:", err);
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

/* -------------------------------- Sintomas --------------------------------- */

export async function addSymptomAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  await ensureDbReady();
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
        notes: data.notes || "",
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
  } catch (err) {
    console.error("Erro ao salvar sintoma:", err);
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function deleteSymptomAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await ensureDbReady();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const sync = await getSyncState(user.id);
  sync.userId = user.id;
  if (!sync.deletedSymptomIds.includes(id)) {
    sync.deletedSymptomIds.push(id);
    await saveSyncState(sync);
  }

  await db
    .update(symptoms)
    .set({ deletedAt: new Date() })
    .where(and(eq(symptoms.id, id), eq(symptoms.userId, user.id)))
    .catch(() => {});

  refreshCareViews();
}

/* -------------------------------- Medições --------------------------------- */

export async function addBloodPressureAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  await ensureDbReady();
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
    return successState("Pressão registrada com sucesso.");
  } catch (err) {
    console.error("Erro ao salvar pressão:", err);
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function addGlucoseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  await ensureDbReady();
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
    return successState("Glicemia registrada com sucesso.");
  } catch (err) {
    console.error("Erro ao salvar glicemia:", err);
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function addHydrationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await ensureDbReady();
  const parsed = hydrationSchema.safeParse({ amountMl: formData.get("amountMl") });
  if (!parsed.success) return;

  const amount = parsed.data.amountMl;

  // 1. Sincroniza hidratação acumulada (evita saltos entre instâncias serverless)
  const sync = await getSyncState(user.id);
  sync.userId = user.id;
  const newTotal = Math.min(10000, (sync.hydrationTotal || 0) + amount);
  sync.hydrationTotal = newTotal;
  await saveSyncState(sync);

  // 2. Persiste medição
  const now = new Date();
  await db.insert(measurements).values({
    userId: user.id,
    kind: "hydration",
    value: String(amount),
    unit: "ml",
    measuredAt: now,
  }).catch(() => {});

  await addTimelineEvent({
    userId: user.id,
    category: "measurement",
    title: `Água: ${amount} ml`,
    occurredAt: now,
  }).catch(() => {});

  refreshCareViews();
}

export async function deleteMeasurementAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await ensureDbReady();
  const id = String(formData.get("id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  if (!id) return;

  const sync = await getSyncState(user.id);
  sync.userId = user.id;
  if (!sync.deletedMeasurementIds.includes(id)) {
    sync.deletedMeasurementIds.push(id);
    await saveSyncState(sync);
  }

  await db
    .update(measurements)
    .set({ deletedAt: new Date() })
    .where(and(eq(measurements.id, id), eq(measurements.userId, user.id)))
    .catch(() => {});

  void measurementMeta(kind);
  refreshCareViews();
}
