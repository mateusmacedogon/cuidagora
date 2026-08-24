"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser, destroySession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { errorState, type ActionState } from "@/lib/action-state";

/**
 * LGPD — direito à eliminação.
 * A conta e TODOS os registros vinculados são apagados em cascata (ON DELETE CASCADE).
 */
export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim().toUpperCase();

  if (confirmation !== "EXCLUIR") {
    return errorState("Para confirmar, escreva a palavra EXCLUIR.", {
      confirmation: "Escreva exatamente: EXCLUIR",
    });
  }

  const rows = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const account = rows[0];
  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    return errorState("Senha incorreta.", { password: "Confira sua senha." });
  }

  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  redirect("/?conta=excluida");
}
