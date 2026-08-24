"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { hydrationGoalSchema } from "@/lib/validation";
import { errorState, successState, zodErrorState, type ActionState } from "@/lib/action-state";

export type AccessibilityPatch = {
  simplifiedMode?: boolean;
  elderMode?: boolean;
  highContrast?: boolean;
  readAloud?: boolean;
};

export async function ensurePreferences(userId: string) {
  await db.insert(userPreferences).values({ userId }).onConflictDoNothing();
}

export async function saveAccessibilityPreferences(patch: AccessibilityPatch): Promise<void> {
  const user = await requireUser();
  await ensurePreferences(user.id);
  await db
    .update(userPreferences)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userPreferences.userId, user.id));
  revalidatePath("/", "layout");
}

export async function saveHydrationGoal(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = hydrationGoalSchema.safeParse({ hydrationGoalMl: formData.get("hydrationGoalMl") });
  if (!parsed.success) return zodErrorState(parsed.error);

  try {
    await ensurePreferences(user.id);
    await db
      .update(userPreferences)
      .set({ hydrationGoalMl: parsed.data.hydrationGoalMl, updatedAt: new Date() })
      .where(eq(userPreferences.userId, user.id));
    revalidatePath("/cuidados/medicoes");
    revalidatePath("/inicio");
    return successState("Meta de água atualizada.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}
