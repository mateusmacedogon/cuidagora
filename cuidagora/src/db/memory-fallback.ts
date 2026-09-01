import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { SCHEMA_SQL } from "./schema-sql";
import { seedDemoData } from "./seed-data";

const globalForMem = globalThis as typeof globalThis & {
  __pgliteInstance?: PGlite;
  __pgliteDb?: any;
  __pgliteInitPromise?: Promise<void>;
};

function getPGliteInstance(): PGlite {
  if (!globalForMem.__pgliteInstance) {
    globalForMem.__pgliteInstance = new PGlite();
  }
  return globalForMem.__pgliteInstance;
}

function getPGliteDbInstance() {
  if (!globalForMem.__pgliteDb) {
    const inst = getPGliteInstance();
    globalForMem.__pgliteDb = drizzle(inst, { schema });
  }
  return globalForMem.__pgliteDb;
}

export const pglite = new Proxy({} as PGlite, {
  get(_target, prop) {
    const inst = getPGliteInstance();
    const val = (inst as any)[prop];
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export const pgliteDb = new Proxy({} as any, {
  get(_target, prop) {
    const inst = getPGliteDbInstance();
    const val = (inst as any)[prop];
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export async function ensurePGliteReady(): Promise<void> {
  if (globalForMem.__pgliteInitPromise) {
    return globalForMem.__pgliteInitPromise;
  }

  globalForMem.__pgliteInitPromise = (async () => {
    try {
      const inst = getPGliteInstance();
      const sql = SCHEMA_SQL.replace(/CREATE EXTENSION[^\;]+\;/gi, "");
      await inst.exec(sql);
      await seedDemoData(inst);
    } catch (err) {
      console.warn("Aviso ao inicializar fallback em memória:", err);
      // Limpa a promise para permitir nova tentativa se falhou
      globalForMem.__pgliteInitPromise = undefined;
      throw err;
    }
  })();

  return globalForMem.__pgliteInitPromise;
}
