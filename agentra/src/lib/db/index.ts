import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../drizzle/schema";

let client: ReturnType<typeof postgres> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!client) {
    client = postgres(process.env.DATABASE_URL, { max: 10 });
  }
  return drizzle(client, { schema });
}

export type AgentraDb = ReturnType<typeof getDb>;
