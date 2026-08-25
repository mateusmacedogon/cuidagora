import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { pglite, pgliteDb, ensurePGliteReady } from "./memory-fallback";

const databaseUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const isRemotePostgres =
  Boolean(databaseUrl) &&
  !databaseUrl?.includes("127.0.0.1") &&
  !databaseUrl?.includes("localhost");

const globalForDb = globalThis as typeof globalThis & {
  __cuidagoraDb?: NodePgDatabase<typeof schema>;
  __cuidagoraPool?: any;
};

function initDb(): { db: NodePgDatabase<typeof schema>; pool: any } {
  if (globalForDb.__cuidagoraDb) {
    return { db: globalForDb.__cuidagoraDb, pool: globalForDb.__cuidagoraPool };
  }

  if (isRemotePostgres && databaseUrl) {
    const isLocal =
      databaseUrl.includes("127.0.0.1") || databaseUrl.includes("localhost");

    const poolInstance = new Pool({
      connectionString: databaseUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: process.env.NODE_ENV === "production" ? 10 : 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    const dbInstance = drizzlePg(poolInstance, { schema });
    globalForDb.__cuidagoraPool = poolInstance;
    globalForDb.__cuidagoraDb = dbInstance;
    return { db: dbInstance, pool: poolInstance };
  }

  globalForDb.__cuidagoraPool = pglite;
  globalForDb.__cuidagoraDb = pgliteDb as unknown as NodePgDatabase<typeof schema>;
  return { db: pgliteDb as unknown as NodePgDatabase<typeof schema>, pool: pglite };
}

export async function ensureDbReady() {
  if (isRemotePostgres) return;
  await ensurePGliteReady();
}

export function isRemoteDatabase(): boolean {
  return isRemotePostgres;
}

export function getDatabaseProvider(): "postgresql" | "pglite" {
  return isRemotePostgres ? "postgresql" : "pglite";
}

export const { db, pool } = initDb();
