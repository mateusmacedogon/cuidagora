"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db, ensureDbReady } from "@/db";
import { passwordResetTokens, sessions, userPreferences, users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth/session";
import { clearSyncState } from "@/lib/sync/client-state";
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
    email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : raw.email,
    acceptedTerms: formData.get("acceptedTerms") === "on",
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const { name, email, password, accountType } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    await ensureDbReady();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      return errorState("Este e-mail já tem uma conta.", {
        email: "Já existe uma conta com este e-mail. Tente entrar.",
      });
    }

    const passwordHash = await hashPassword(password);
    const inserted = await db
      .insert(users)
      .values({ name, email: normalizedEmail, passwordHash, accountType })
      .returning({ id: users.id });

    const user = inserted[0];
    if (!user) return errorState("Não foi possível criar sua conta agora. Tente novamente.");

    await db.insert(userPreferences).values({ userId: user.id }).onConflictDoNothing();
    await createSession(user.id, { email: normalizedEmail, name, accountType });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return errorState(
      "Não foi possível salvar os dados. Tente novamente em instantes.",
    );
  }

  redirect("/inicio");
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const parsed = signInSchema.safeParse({
    ...raw,
    email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : raw.email,
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  let successUserId: string | null = null;
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  try {
    await ensureDbReady();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        accountType: users.accountType,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
      .limit(1);

    const account = rows[0];
    const genericError = errorState("E-mail ou senha incorretos. Confira e tente novamente.");
    if (!account) {
      await hashPassword(parsed.data.password);
      return genericError;
    }

    const valid = await verifyPassword(parsed.data.password, account.passwordHash);
    if (!valid) return genericError;

    await createSession(account.id, {
      email: account.email,
      name: account.name,
      accountType: account.accountType,
    });
    successUserId = account.id;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return errorState(
      "Não foi possível concluir o login agora. Tente novamente.",
    );
  }

  if (successUserId) {
    redirect("/inicio");
  }

  return errorState("E-mail ou senha incorretos. Confira e tente novamente.");
}

export async function demoSignInAction(role: "maria" | "joao"): Promise<ActionState | void> {
  let successUserId: string | null = null;
  try {
    await ensureDbReady();
    const targetEmail = role === "joao" ? "joao@exemplo.com" : "maria@exemplo.com";
    const name =
      role === "joao" ? "João Fictício (cuidador)" : "Maria Aparecida (demonstração)";
    const accountType = role === "joao" ? "caregiver" : "person";

    let rows = await db
      .select({ id: users.id, name: users.name, email: users.email, accountType: users.accountType })
      .from(users)
      .where(and(eq(users.email, targetEmail), isNull(users.deletedAt)))
      .limit(1);

    if (!rows[0]) {
      const passwordHash = await hashPassword("cuidagora123");
      const inserted = await db
        .insert(users)
        .values({ name, email: targetEmail, passwordHash, accountType })
        .returning({ id: users.id, name: users.name, email: users.email, accountType: users.accountType });

      if (inserted[0]) {
        await db
          .insert(userPreferences)
          .values({ userId: inserted[0].id })
          .onConflictDoNothing();
        rows = inserted;
      }
    }

    const user = rows[0];
    if (user) {
      await createSession(user.id, {
        email: user.email,
        name: user.name,
        accountType: user.accountType,
      });
      successUserId = user.id;
    } else {
      return errorState("Não foi possível carregar a conta de demonstração.");
    }
  } catch (e) {
    console.error("Erro ao autenticar demonstração:", e);
    return errorState("Falha temporária ao conectar a conta de demonstração.");
  }

  if (successUserId) {
    redirect("/inicio");
  }
}

export async function signOutAction(): Promise<void> {
  try {
    await destroySession();
    await clearSyncState();
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);
  }
  redirect("/entrar");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formToObject(formData);
  const parsed = forgotPasswordSchema.safeParse({
    ...raw,
    email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : raw.email,
  });
  if (!parsed.success) return zodErrorState(parsed.error);

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  try {
    await ensureDbReady();
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
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
      message: `Link de recuperação gerado (válido por 1 hora): /redefinir-senha?token=${token}`,
      errors: {},
    };
  } catch (error) {
    console.error("Erro ao solicitar redefinição:", error);
    return errorState("Não foi possível processar a recuperação agora.");
  }
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return zodErrorState(parsed.error);

  const id = tokenHash(parsed.data.token);
  try {
    await ensureDbReady();
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

    // Revoga todas as sessões ativas para garantir segurança contra invasão
    await db.delete(sessions).where(eq(sessions.userId, token.userId));

    return successState("Senha alterada com sucesso! Agora você já pode entrar.");
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return errorState("Não foi possível salvar a nova senha.");
  }
}
