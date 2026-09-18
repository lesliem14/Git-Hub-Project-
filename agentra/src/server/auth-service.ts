import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { accounts, ledgerAccounts, users } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { setUserTronWallet } from "./deposit-address";
import { isValidTrc20Address } from "@/lib/tron-utils";
import { USER_SESSION_COOKIE } from "@/lib/constants";
import { createHash, timingSafeEqual } from "crypto";

export interface SessionUser {
  userId: string;
  accountId: string;
  email: string;
  username: string;
}

function sessionToken(userId: string, accountId: string): string {
  const secret = process.env.AGENTRA_SESSION_SECRET ?? "dev-session-secret-change-me";
  return createHash("sha256")
    .update(`${userId}:${accountId}:${secret}`)
    .digest("hex");
}

function referralCodeFromUsername(username: string): string {
  return `AGT-${username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function registerUser(input: {
  email: string;
  username: string;
  password: string;
  usdtPayoutTrc20: string;
  referralCode?: string;
}): Promise<SessionUser> {
  if (!isValidTrc20Address(input.usdtPayoutTrc20)) {
    throw new Error("A valid USDT TRC-20 wallet address is required");
  }

  const db = getDb();
  const hash = await bcrypt.hash(input.password, 12);

  let referredByAccountId: string | null = null;
  if (input.referralCode) {
    const ref = await db.query.accounts.findFirst({
      where: eq(accounts.referralCode, input.referralCode),
    });
    referredByAccountId = ref?.id ?? null;
  }

  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      username: input.username,
      passwordHash: hash,
    })
    .returning();

  const [account] = await db
    .insert(accounts)
    .values({
      userId: user.id,
      usdtTrc20Payout: input.usdtPayoutTrc20.trim(),
      depositAddressTrc20: input.usdtPayoutTrc20.trim(),
      referralCode: referralCodeFromUsername(input.username),
      referredByAccountId,
    })
    .returning();

  await db.insert(ledgerAccounts).values({ accountId: account.id });
  const link = await setUserTronWallet(account.id, input.usdtPayoutTrc20);
  if (!link.ok) throw new Error(link.error ?? "Wallet link failed");

  const session: SessionUser = {
    userId: user.id,
    accountId: account.id,
    email: user.email,
    username: user.username ?? input.username,
  };
  await setSessionCookie(session);
  return session;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<SessionUser | null> {
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });
  if (!user?.passwordHash) return null;
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return null;

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, user.id),
  });
  if (!account) return null;

  const session: SessionUser = {
    userId: user.id,
    accountId: account.id,
    email: user.email,
    username: user.username ?? user.email.split("@")[0],
  };
  await setSessionCookie(session);
  return session;
}

export async function setSessionCookie(session: SessionUser): Promise<void> {
  const jar = await cookies();
  const token = sessionToken(session.userId, session.accountId);
  jar.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  jar.set(`${USER_SESSION_COOKIE}_aid`, session.accountId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(USER_SESSION_COOKIE);
  jar.delete(`${USER_SESSION_COOKIE}_aid`);
}

export async function getAccountProfile(accountId: string) {
  const db = getDb();
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });
  return {
    userTrc20Wallet: account?.usdtTrc20Payout ?? null,
    usdtPayoutTrc20: account?.usdtTrc20Payout ?? null,
    licenseActivated: account?.licenseActivated ?? false,
    referralCode: account?.referralCode ?? null,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(USER_SESSION_COOKIE)?.value;
  const accountId = jar.get(`${USER_SESSION_COOKIE}_aid`)?.value;
  if (!token || !accountId) return null;

  const db = getDb();
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });
  if (!account) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, account.userId),
  });
  if (!user) return null;

  const expected = sessionToken(user.id, account.id);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return {
    userId: user.id,
    accountId: account.id,
    email: user.email,
    username: user.username ?? user.email.split("@")[0],
  };
}
