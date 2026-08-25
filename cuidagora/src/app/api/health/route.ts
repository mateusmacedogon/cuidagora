import { db, ensureDbReady, getDatabaseProvider, isRemoteDatabase } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    await ensureDbReady();
    await db.execute(sql`select 1`);
    const latencyMs = Date.now() - startTime;

    return Response.json(
      {
        status: "healthy",
        ok: true,
        database: {
          connected: true,
          provider: getDatabaseProvider(),
          isRemote: isRemoteDatabase(),
          latencyMs,
        },
        environment: process.env.NODE_ENV ?? "development",
        vercel: {
          deployed: Boolean(process.env.VERCEL),
          region: process.env.VERCEL_REGION || "local",
          gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        ok: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}

