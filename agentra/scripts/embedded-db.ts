import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

const PORT = parseInt(process.env.AGENTRA_PG_PORT ?? "54329", 10);
const DATA_DIR = join(process.cwd(), ".agentra-pg-data");
const PID_FILE = join(process.cwd(), ".agentra-pg.pid");
const URL_FILE = join(process.cwd(), ".agentra-pg.url");

async function stopExisting() {
  if (!existsSync(PID_FILE)) return;
  const pid = parseInt(readFileSync(PID_FILE, "utf8"), 10);
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    /* already stopped */
  }
  unlinkSync(PID_FILE);
}

async function pgResponds(url: string): Promise<boolean> {
  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(url, { max: 1, connect_timeout: 2 });
    await sql`select 1`;
    await sql.end();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (process.argv.includes("--stop")) {
    await stopExisting();
    console.log("Embedded Postgres stop signal sent.");
    return;
  }

  mkdirSync(DATA_DIR, { recursive: true });

  const existingUrl = existsSync(URL_FILE) ? readFileSync(URL_FILE, "utf8").trim() : "";
  if (existingUrl && (await pgResponds(existingUrl))) {
    writeFileSync(PID_FILE, String(process.pid));
    console.log(`Embedded Postgres already running — reusing ${existingUrl}`);
    console.log(`DATABASE_URL=${existingUrl}`);
    await new Promise(() => {});
    return;
  }

  const lockFile = join(DATA_DIR, "postmaster.pid");
  if (existsSync(lockFile)) {
    try {
      unlinkSync(lockFile);
    } catch {
      /* ignore */
    }
  }

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: "agentra",
    password: "agentra_dev",
    port: PORT,
    persistent: true,
  });

  const clusterReady = existsSync(join(DATA_DIR, "PG_VERSION"));
  if (!clusterReady) {
    await pg.initialise();
  }
  await pg.start();

  try {
    await pg.createDatabase("agentra");
  } catch {
    /* database may already exist */
  }

  const databaseUrl = `postgres://agentra:agentra_dev@127.0.0.1:${PORT}/agentra`;
  writeFileSync(URL_FILE, databaseUrl);
  writeFileSync(PID_FILE, String(process.pid));

  console.log(`Embedded Postgres listening on ${PORT}`);
  console.log(`DATABASE_URL=${databaseUrl}`);

  const shutdown = async () => {
    try {
      await pg.stop();
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(PID_FILE);
    } catch {
      /* ignore */
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  if (process.argv.includes("--once")) {
    await pg.stop();
    unlinkSync(PID_FILE);
    return;
  }

  await new Promise(() => {});
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
