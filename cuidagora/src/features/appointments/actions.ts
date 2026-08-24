"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentQuestions, appointments } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { addTimelineEvent } from "@/features/timeline/service";
import {
  errorState,
  formToObject,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-state";
import { appointmentQuestionSchema, appointmentSchema } from "@/lib/validation";
import { formatDateTime, toInstant } from "@/lib/date";

function refresh(id?: string) {
  revalidatePath("/consultas");
  revalidatePath("/inicio");
  revalidatePath("/resumo");
  if (id) revalidatePath(`/consultas/${id}`);
}

export async function saveAppointmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = appointmentSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  const scheduledAt = toInstant(data.date, data.time);

  try {
    if (data.id) {
      await db
        .update(appointments)
        .set({
          specialty: data.specialty,
          professional: data.professional,
          location: data.location,
          notes: data.notes,
          scheduledAt,
          updatedAt: new Date(),
        })
        .where(and(eq(appointments.id, data.id), eq(appointments.userId, user.id)));
      refresh(data.id);
      return successState("Consulta atualizada.");
    }

    const inserted = await db
      .insert(appointments)
      .values({
        userId: user.id,
        specialty: data.specialty,
        professional: data.professional,
        location: data.location,
        notes: data.notes,
        scheduledAt,
      })
      .returning({ id: appointments.id });

    await addTimelineEvent({
      userId: user.id,
      category: "appointment",
      title: `Consulta marcada: ${data.specialty}`,
      description: `${formatDateTime(scheduledAt)}${data.professional ? ` · ${data.professional}` : ""}`,
      occurredAt: new Date(),
      referenceId: inserted[0]?.id,
    });

    refresh();
    return successState("Consulta cadastrada.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function deleteAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .update(appointments)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));
  refresh(id);
}

export async function addQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const raw = formToObject(formData);
  const parsed = appointmentQuestionSchema.safeParse({
    ...raw,
    appointmentId: raw.appointmentId ? raw.appointmentId : undefined,
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  try {
    await db.insert(appointmentQuestions).values({
      userId: user.id,
      appointmentId: parsed.data.appointmentId ?? null,
      question: parsed.data.question,
    });
    refresh(parsed.data.appointmentId);
    return successState("Pergunta salva para levar à consulta.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function toggleQuestionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const answered = formData.get("answered") === "1";
  if (!id) return;
  await db
    .update(appointmentQuestions)
    .set({ answered })
    .where(and(eq(appointmentQuestions.id, id), eq(appointmentQuestions.userId, user.id)));
  refresh(String(formData.get("appointmentId") ?? ""));
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .delete(appointmentQuestions)
    .where(and(eq(appointmentQuestions.id, id), eq(appointmentQuestions.userId, user.id)));
  refresh(String(formData.get("appointmentId") ?? ""));
}
