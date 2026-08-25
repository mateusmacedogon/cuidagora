import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { pglite, pgliteDb, ensurePGliteReady } from "./memory-fallback";

const databaseUrl = process.env.DATABASE_URL;

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
    const poolInstance = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
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

export const { db, pool } = initDb();
