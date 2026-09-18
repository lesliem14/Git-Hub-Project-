import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "./constants";

function expectedToken(): string {
  return process.env.AGENTRA_ADMIN_TOKEN ?? "dev-admin-token-change-in-production";
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.AGENTRA_ADMIN_PASSWORD ?? "agentra-admin-dev";
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const cookie = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookie) return false;
  const expected = expectedToken();
  try {
    const a = Buffer.from(cookie);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminSessionCookieValue(): string {
  return expectedToken();
}
