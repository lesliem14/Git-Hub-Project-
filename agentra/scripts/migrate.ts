import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://agentra:agentra_dev@localhost:5432/agentra";
  const sql = postgres(url, { max: 1 });

  await sql`
    CREATE TABLE IF NOT EXISTS agentra_schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const dir = join(__dirname, "../drizzle/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const existing = await sql`
      SELECT filename FROM agentra_schema_migrations WHERE filename = ${file}
    `;
    if (existing.length > 0) {
      console.log("Skip (already applied)", file);
      continue;
    }
    const migration = readFileSync(join(dir, file), "utf8");
    console.log("Applying", file);
    await sql.begin(async (tx) => {
      await tx.unsafe(migration);
      await tx`INSERT INTO agentra_schema_migrations (filename) VALUES (${file})`;
    });
  }
  console.log("All migrations applied.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
