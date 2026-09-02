import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { SCHEMA_SQL } from "./schema-sql";
import { seedDemoData } from "./seed-data";
import { pglite, pgliteDb, ensurePGliteReady } from "./memory-fallback";

function isPlaceholder(url?: string): boolean {
  if (!url) return true;
  return (
    url.includes("ep-cool-cloud") ||
    url.includes("default:default") ||
    url.includes("placeholder") ||
    url.includes("user:password")
  );
}

const rawDatabaseUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const databaseUrl = isPlaceholder(rawDatabaseUrl) ? undefined : rawDatabaseUrl;
const isConfiguredPostgres = Boolean(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __cuidagoraDb?: NodePgDatabase<typeof schema>;
  __cuidagoraPool?: any;
  __cuidagoraPgInitPromise?: Promise<void>;
};

function initDb(): { db: NodePgDatabase<typeof schema>; pool: any } {
  if (globalForDb.__cuidagoraDb) {
    return { db: globalForDb.__cuidagoraDb, pool: globalForDb.__cuidagoraPool };
  }

  if (isConfiguredPostgres && databaseUrl) {
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

async function ensurePostgresReady(poolInstance: Pool): Promise<void> {
  if (globalForDb.__cuidagoraPgInitPromise) {
    return globalForDb.__cuidagoraPgInitPromise;
  }

  globalForDb.__cuidagoraPgInitPromise = (async () => {
    try {
      try {
        await poolInstance.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
      } catch {
        // Ignora caso o banco não permita criar extensões explicitamente
      }

      const cleanSql = SCHEMA_SQL.replace(/CREATE EXTENSION[^\;]+\;/gi, "");
      await poolInstance.query(cleanSql);

      const res = await poolInstance.query(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        ["maria@exemplo.com"],
      );
      if (!res.rows || res.rows.length === 0) {
        await seedDemoData(poolInstance);
      }
    } catch (err) {
      console.error("Aviso ao auto-inicializar PostgreSQL:", err);
      globalForDb.__cuidagoraPgInitPromise = undefined;
      throw err;
    }
  })();

  return globalForDb.__cuidagoraPgInitPromise;
}

let isDbInitialized = false;

export async function ensureDbReady() {
  if (isDbInitialized) return;

  if (isConfiguredPostgres) {
    const { pool: poolInstance } = initDb();
    if (poolInstance && typeof poolInstance.query === "function") {
      await ensurePostgresReady(poolInstance);
      isDbInitialized = true;
      return;
    }
  }
  await ensurePGliteReady();
  isDbInitialized = true;
}

export function isRemoteDatabase(): boolean {
  return isConfiguredPostgres;
}

export function getDatabaseProvider(): "postgresql" | "pglite" {
  return isConfiguredPostgres ? "postgresql" : "pglite";
}

export const { db, pool } = initDb();
