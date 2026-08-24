"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { caregiverAccess, users } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import {
  errorState,
  formToObject,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-state";
import { caregiverInviteSchema, caregiverPermissionsSchema } from "@/lib/validation";
import { PERMISSION_KEYS, type PermissionSet } from "@/lib/domain";

function readPermissions(formData: FormData): Record<string, boolean> {
  return Object.fromEntries(PERMISSION_KEYS.map((key) => [key, formData.get(key) === "on"]));
}

function refresh() {
  revalidatePath("/perfil/cuidadores");
  revalidatePath("/acompanhando");
}

export async function inviteCaregiverAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = caregiverInviteSchema.safeParse({
    ...formToObject(formData),
    ...readPermissions(formData),
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const { caregiverName, caregiverEmail, ...permissions } = parsed.data;

  if (caregiverEmail === user.email) {
    return errorState("Você não precisa liberar acesso para o seu próprio e-mail.", {
      caregiverEmail: "Use o e-mail da pessoa que vai te acompanhar.",
    });
  }

  try {
    const match = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, caregiverEmail))
      .limit(1);

    await db.insert(caregiverAccess).values({
      ownerId: user.id,
      caregiverEmail,
      caregiverName,
      caregiverId: match[0]?.id ?? null,
      permissions: permissions as PermissionSet,
      status: "active",
    });

    refresh();
    return successState(
      `${caregiverName} agora pode ver o que você liberou. Você pode mudar ou remover quando quiser.`,
    );
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function updateCaregiverPermissionsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = caregiverPermissionsSchema.safeParse({
    accessId: formData.get("accessId"),
    ...readPermissions(formData),
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const { accessId, ...permissions } = parsed.data;

  try {
    await db
      .update(caregiverAccess)
      .set({ permissions: permissions as PermissionSet, updatedAt: new Date() })
      .where(and(eq(caregiverAccess.id, accessId), eq(caregiverAccess.ownerId, user.id)));
    refresh();
    return successState("Permissões atualizadas.");
  } catch {
    return errorState("Não foi possível salvar agora. Tente novamente.");
  }
}

export async function revokeCaregiverAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("accessId") ?? "");
  if (!id) return;
  await db
    .update(caregiverAccess)
    .set({ status: "revoked", permissions: {}, updatedAt: new Date() })
    .where(and(eq(caregiverAccess.id, id), eq(caregiverAccess.ownerId, user.id)));
  refresh();
}
