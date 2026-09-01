import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db, ensureDbReady } from "@/db";
import { sessions, userPreferences, users } from "@/db/schema";

export const SESSION_COOKIE = "cuidagora_session";
const SESSION_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  await ensureDbReady();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });

  const store = await cookies();
  // Em produção na Vercel / HTTPS, usa cookie seguro; em localhost / ambiente de teste, permite HTTP
  const isSecure =
    process.env.NODE_ENV === "production" &&
    (process.env.VERCEL === "1" || process.env.COOKIE_SECURE === "true");

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  try {
    await ensureDbReady();
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (token) {
      await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
    }
    store.delete(SESSION_COOKIE);
  } catch (error) {
    console.error("Erro ao destruir sessão:", error);
  }
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  accountType: string;
  preferences: {
    simplifiedMode: boolean;
    elderMode: boolean;
    highContrast: boolean;
    readAloud: boolean;
    hydrationGoalMl: number;
  };
};

const DEFAULT_PREFERENCES: SessionUser["preferences"] = {
  simplifiedMode: false,
  elderMode: false,
  highContrast: false,
  readAloud: true,
  hydrationGoalMl: 2000,
};

/** Lê a sessão do cookie. Retorna null quando ausente, expirada ou de conta excluída. */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    await ensureDbReady();
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        accountType: users.accountType,
        simplifiedMode: userPreferences.simplifiedMode,
        elderMode: userPreferences.elderMode,
        highContrast: userPreferences.highContrast,
        readAloud: userPreferences.readAloud,
        hydrationGoalMl: userPreferences.hydrationGoalMl,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .leftJoin(userPreferences, eq(userPreferences.userId, users.id))
      .where(
        and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date()), isNull(users.deletedAt)),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      accountType: row.accountType,
      preferences: {
        simplifiedMode: row.simplifiedMode ?? DEFAULT_PREFERENCES.simplifiedMode,
        elderMode: row.elderMode ?? DEFAULT_PREFERENCES.elderMode,
        highContrast: row.highContrast ?? DEFAULT_PREFERENCES.highContrast,
        readAloud: row.readAloud ?? DEFAULT_PREFERENCES.readAloud,
        hydrationGoalMl: row.hydrationGoalMl ?? DEFAULT_PREFERENCES.hydrationGoalMl,
      },
    };
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("DYNAMIC_SERVER_USAGE")) {
      throw error;
    }
    console.error("Erro ao obter usuário da sessão:", error);
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");
  return user;
}
