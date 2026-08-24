"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { careGuidelines } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import {
  errorState,
  formToObject,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-state";
import { guidelineSchema } from "@/lib/validation";

function refresh() {
  revalidatePath("/perfil/orientacoes");
  revalidatePath("/inicio");
  revalidatePath("/cuidados");
}

/**
 * O usuário (ou profissional autorizado) cadastra a orientação recebida.
 * O sistema apenas armazena e compara — nunca cria regra clínica sozinho.
 */
export async function saveGuidelineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = guidelineSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const data = parsed.data;
  try {
    if (data.id) {
      await db
        .update(careGuidelines)
        .set({
          level: data.level,
          title: data.title,
          instruction: data.instruction,
          metric: data.metric,
          comparator: data.comparator,
          threshold: String(data.threshold),
          source: data.source,
          updatedAt: new Date(),
        })
        .where(and(eq(careGuidelines.id, data.id), eq(careGuidelines.userId, user.id)));
      refresh();
      return successState("Orientação atualizada.");
    }

    await db.insert(careGuidelines).values({
      userId: user.id,
      level: data.level,
      title: data.title,
      instruction: data.instruction,
      metric: data.metric,
      comparator: data.comparator,
      threshold: String(data.threshold),
      source: data.source,
    });
    refresh();
    return successState("Orientação cadastrada. O semáforo passará a considerá-la.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function toggleGuidelineAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "1";
  if (!id) return;
  await db
    .update(careGuidelines)
    .set({ active, updatedAt: new Date() })
    .where(and(eq(careGuidelines.id, id), eq(careGuidelines.userId, user.id)));
  refresh();
}

export async function deleteGuidelineAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .delete(careGuidelines)
    .where(and(eq(careGuidelines.id, id), eq(careGuidelines.userId, user.id)));
  refresh();
}
