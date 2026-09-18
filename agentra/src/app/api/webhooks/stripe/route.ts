import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { stripeWebhookEvents, accounts, subscriptions } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { LICENSE_FEE_USDT } from "@/lib/constants";

/**
 * Stripe webhook stub — verify signature with STRIPE_WEBHOOK_SECRET in production.
 * MVP primary path: USDT TRC-20 license claim on /fund.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (secret && request.headers.get("stripe-signature")) {
    // Production: stripe.webhooks.constructEvent(body, sig, secret)
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Webhook signature required" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !event.id) {
    return NextResponse.json({ received: true, mode: "noop" });
  }

  const db = getDb();
  await db
    .insert(stripeWebhookEvents)
    .values({ id: event.id, type: event.type ?? "unknown", payload: event as object })
    .onConflictDoNothing();

  if (event.type === "checkout.session.completed") {
    const meta = event.data?.object?.metadata as { accountId?: string } | undefined;
    const accountId = meta?.accountId;
    if (accountId) {
      await db.update(accounts).set({ licenseActivated: true }).where(eq(accounts.id, accountId));
      await db.insert(subscriptions).values({ accountId, tier: "licensed", status: "active" });
    }
  }

  return NextResponse.json({
    received: true,
    note: `License fee reference: ${LICENSE_FEE_USDT} USDT TRC-20 on /fund for MVP`,
  });
}
