import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://agentra:agentra_dev@localhost:5432/agentra";
  const sql = postgres(url, { max: 1 });
  const dir = join(__dirname, "../drizzle/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const migration = readFileSync(join(dir, file), "utf8");
    console.log("Applying", file);
    await sql.unsafe(migration);
  }
  console.log("All migrations applied.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
