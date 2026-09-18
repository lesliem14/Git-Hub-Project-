import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://agentra:agentra_dev@localhost:5432/agentra";
  const sql = postgres(url, { max: 1 });
  const migration = readFileSync(join(__dirname, "../drizzle/migrations/0000_init.sql"), "utf8");
  await sql.unsafe(migration);
  console.log("Migration applied.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
