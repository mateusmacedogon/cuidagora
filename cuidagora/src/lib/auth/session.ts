import { createHash, createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";

import { db, ensureDbReady } from "@/db";
import { sessions, userPreferences, users } from "@/db/schema";
import { MARIA_DEMO_ID, JOAO_DEMO_ID } from "@/db/seed-data";

export const SESSION_COOKIE = "cuidagora_session";
const SESSION_DAYS = 30;

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "cuidagora-resilient-secure-session-secret-2026-v1";

export type SessionPayload = {
  uid: string;
  email: string;
  name: string;
  accountType: string;
  exp: number;
  nonce: string;
};

function signPayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verifyPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expected = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    if (signature !== expected) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as SessionPayload;
    if (!payload.uid || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  userMetadata?: { email?: string; name?: string; accountType?: string },
): Promise<void> {
  await ensureDbReady();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  let email = userMetadata?.email || "";
  let name = userMetadata?.name || "";
  let accountType = userMetadata?.accountType || "person";

  if (!email) {
    try {
      const userRows = await db
        .select({ email: users.email, name: users.name, accountType: users.accountType })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (userRows[0]) {
        email = userRows[0].email;
        name = userRows[0].name;
        accountType = userRows[0].accountType;
      }
    } catch (e) {
      console.warn("Aviso ao carregar dados adicionais para sessão:", e);
    }
  }

  const payload: SessionPayload = {
    uid: userId,
    email: email || (userId === JOAO_DEMO_ID ? "joao@exemplo.com" : "maria@exemplo.com"),
    name: name || (userId === JOAO_DEMO_ID ? "João Fictício (cuidador)" : "Maria Aparecida (demonstração)"),
    accountType,
    exp: expiresAt.getTime(),
    nonce: randomBytes(8).toString("hex"),
  };

  const signedToken = signPayload(payload);

  try {
    const sessionId = createHash("sha256").update(signedToken).digest("hex");
    await db.insert(sessions).values({ id: sessionId, userId, expiresAt }).onConflictDoNothing();
  } catch (err) {
    console.warn("Aviso ao registrar sessão em tabela (usando sessão assinada stateless):", err);
  }

  const store = await cookies();
  const isSecure =
    process.env.NODE_ENV === "production" &&
    (process.env.VERCEL === "1" || process.env.COOKIE_SECURE === "true");

  store.set(SESSION_COOKIE, signedToken, {
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
      const sessionId = createHash("sha256").update(token).digest("hex");
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    store.delete(SESSION_COOKIE);
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);
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

/** Lê e valida a sessão do cookie de forma resiliente a multi-instâncias serverless da Vercel. */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const payload = verifyPayload(token);
    if (!payload) {
      return null;
    }

    await ensureDbReady();

    // 1. Tenta carregar preferências do usuário diretamente por ID
    try {
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
        .from(users)
        .leftJoin(userPreferences, eq(userPreferences.userId, users.id))
        .where(and(eq(users.id, payload.uid), isNull(users.deletedAt)))
        .limit(1);

      if (rows[0]) {
        const row = rows[0];
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
      }

      // 2. Se não encontrou por ID (ex: instância com mapping por email), busca por email
      if (payload.email) {
        const byEmail = await db
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
          .from(users)
          .leftJoin(userPreferences, eq(userPreferences.userId, users.id))
          .where(and(eq(users.email, payload.email.toLowerCase()), isNull(users.deletedAt)))
          .limit(1);

        if (byEmail[0]) {
          const row = byEmail[0];
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
        }
      }
    } catch (dbErr) {
      console.warn("Aviso ao carregar dados do usuário na sessão (usando fallback seguro do token):", dbErr);
    }

    // 3. Fallback autenticado seguro e garantido do payload criptográfico
    return {
      id: payload.uid,
      name: payload.name,
      email: payload.email,
      accountType: payload.accountType,
      preferences: DEFAULT_PREFERENCES,
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
