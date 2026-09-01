import { beforeAll, describe, expect, it } from "vitest";
import { db, ensureDbReady } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Database Resilience & Fallback", () => {
  beforeAll(async () => {
    await ensureDbReady();
  });

  it("should query users successfully from database or in-memory fallback", async () => {
    const rows = await db.select({ email: users.email, name: users.name }).from(users);
    expect(rows.length).toBeGreaterThan(0);
    const maria = rows.find((u) => u.email === "maria@exemplo.com");
    expect(maria).toBeDefined();
    expect(maria?.name).toContain("Maria");
  });

  it("should find demo caregiver Joao", async () => {
    const rows = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.email, "joao@exemplo.com"));
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe("joao@exemplo.com");
  });
});
