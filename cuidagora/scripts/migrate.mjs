/**
 * Executa as migrações (criação de tabelas e índices) no PostgreSQL.
 * Uso:
 *   DATABASE_URL="postgres://..." node scripts/migrate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const isLocal =
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("localhost");

const client = new pg.Client({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function runMigrations() {
  console.log("Iniciando migração do banco de dados...");
  console.log(
    `Conectando a: ${connectionString.replace(/:[^:@]+@/, ":***@")}`,
  );

  try {
    await client.connect();
    const sqlPath = path.join(__dirname, "schema.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    await client.query(sqlContent);
    console.log("✅ Tabelas e índices criados/verificados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar migrações:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
