"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { passwordResetTokens, userPreferences, users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  errorState,
  formToObject,
  successState,
  zodErrorState,
  type ActionState,
} from "@/lib/action-state";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const parsed = signUpSchema.safeParse({
    ...raw,
    acceptedTerms: formData.get("acceptedTerms") === "on",
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const { name, email, password, accountType } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return errorState("Este e-mail já tem uma conta.", {
      email: "Já existe uma conta com este e-mail. Tente entrar.",
    });
  }

  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash, accountType })
    .returning({ id: users.id });

  const user = inserted[0];
  if (!user) return errorState("Não foi possível criar sua conta agora. Tente novamente.");

  await db.insert(userPreferences).values({ userId: user.id }).onConflictDoNothing();
  await createSession(user.id);
  redirect("/inicio");
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const rows = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(and(eq(users.email, parsed.data.email), isNull(users.deletedAt)))
    .limit(1);

  const account = rows[0];
  // Mensagem genérica: não revelamos se o e-mail existe.
  const genericError = errorState("E-mail ou senha incorretos. Confira e tente de novo.");
  if (!account) {
    await hashPassword(parsed.data.password); // custo constante contra enumeração
    return genericError;
  }

  const valid = await verifyPassword(parsed.data.password, account.passwordHash);
  if (!valid) return genericError;

  await createSession(account.id);
  redirect("/inicio");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/entrar");
}

/**
 * MVP sem serviço de e-mail: o link de redefinição é exibido na tela.
 * Em produção este link deve ser enviado por e-mail e nunca mostrado.
 */
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, parsed.data.email), isNull(users.deletedAt)))
    .limit(1);

  const account = rows[0];
  if (!account) {
    return successState(
      "Se existir uma conta com este e-mail, enviaremos as instruções de recuperação.",
    );
  }

  const token = randomBytes(24).toString("hex");
  await db.insert(passwordResetTokens).values({
    id: tokenHash(token),
    userId: account.id,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  return {
    status: "success",
    message: `Link de recuperação criado (válido por 1 hora): /redefinir-senha?token=${token}`,
    errors: {},
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const id = tokenHash(parsed.data.token);
  const rows = await db
    .select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.id, id),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt),
      ),
    )
    .limit(1);

  const token = rows[0];
  if (!token) return errorState("Este link expirou. Peça um novo link de recuperação.");

  const passwordHash = await hashPassword(parsed.data.password);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, token.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, token.id));

  return successState("Senha alterada. Agora você já pode entrar.");
}
