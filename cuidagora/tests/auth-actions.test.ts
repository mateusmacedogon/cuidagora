import { describe, it, expect, beforeAll } from "vitest";
import { ensureDbReady, db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { signInSchema, signUpSchema } from "@/lib/validation";

describe("Auth Flow Verification", () => {
  beforeAll(async () => {
    await ensureDbReady();
  });

  it("authenticates maria@exemplo.com with cuidagora123", async () => {
    const rows = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, "maria@exemplo.com"))
      .limit(1);

    expect(rows.length).toBe(1);
    const valid = await verifyPassword("cuidagora123", rows[0].passwordHash);
    expect(valid).toBe(true);
  });

  it("authenticates joao@exemplo.com with cuidagora123", async () => {
    const rows = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, "joao@exemplo.com"))
      .limit(1);

    expect(rows.length).toBe(1);
    const valid = await verifyPassword("cuidagora123", rows[0].passwordHash);
    expect(valid).toBe(true);
  });

  it("validates signInSchema successfully", () => {
    const result = signInSchema.safeParse({
      email: "maria@exemplo.com",
      password: "cuidagora123",
    });
    expect(result.success).toBe(true);
  });
});
