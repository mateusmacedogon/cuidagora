import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  ALL_PERMISSIONS,
  NO_PERMISSIONS,
  PERMISSION_KEYS,
  normalizePermissions,
} from "@/lib/domain";

describe("Autenticação — armazenamento de senha", () => {
  it("nunca guarda a senha em texto puro", async () => {
    const stored = await hashPassword("cuidagora123");
    expect(stored).not.toContain("cuidagora123");
    expect(stored.split(":")).toHaveLength(2);
  });

  it("gera hashes diferentes para a mesma senha (salt aleatório)", async () => {
    const first = await hashPassword("cuidagora123");
    const second = await hashPassword("cuidagora123");
    expect(first).not.toBe(second);
  });

  it("valida a senha correta e rejeita a incorreta", async () => {
    const stored = await hashPassword("cuidagora123");
    expect(await verifyPassword("cuidagora123", stored)).toBe(true);
    expect(await verifyPassword("cuidagora124", stored)).toBe(false);
    expect(await verifyPassword("cuidagora123", "formato-invalido")).toBe(false);
  });
});

describe("Autorização — menor privilégio do cuidador", () => {
  it("nega tudo quando não há permissões salvas", () => {
    expect(normalizePermissions(null)).toEqual(NO_PERMISSIONS);
    expect(normalizePermissions({})).toEqual(NO_PERMISSIONS);
  });

  it("aceita apenas booleanos verdadeiros explícitos", () => {
    const result = normalizePermissions({ tasks: "sim", medications: true, timeline: 1 });
    expect(result.tasks).toBe(false);
    expect(result.medications).toBe(true);
    expect(result.timeline).toBe(false);
  });

  it("ignora chaves desconhecidas enviadas pelo cliente", () => {
    const result = normalizePermissions({ admin: true, deleteEverything: true });
    expect(Object.keys(result).sort()).toEqual([...PERMISSION_KEYS].sort());
  });

  it("o dono dos dados possui todas as permissões", () => {
    for (const key of PERMISSION_KEYS) {
      expect(ALL_PERMISSIONS[key]).toBe(true);
    }
  });
});
