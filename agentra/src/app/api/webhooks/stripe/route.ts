import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { stripeWebhookEvents } from "../../../../../drizzle/schema";
import { constructStripeEvent } from "@/server/stripe-service";
import { activateSoftwareLicense } from "@/server/licensing-activate";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let eventId: string;
  let eventType: string;
  let accountId: string | undefined;
  let customerId: string | undefined;

  if (sig && process.env.STRIPE_WEBHOOK_SECRET) {
    const event = constructStripeEvent(body, sig);
    if (!event) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    eventId = event.id;
    eventType = event.type;
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        metadata?: { accountId?: string };
        client_reference_id?: string;
        customer?: string;
      };
      accountId = session.metadata?.accountId ?? session.client_reference_id ?? undefined;
      customerId = typeof session.customer === "string" ? session.customer : undefined;
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook signature required" }, { status: 401 });
    }
    let parsed: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
    try {
      parsed = JSON.parse(body) as typeof parsed;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    eventId = parsed.id ?? `dev_${Date.now()}`;
    eventType = parsed.type ?? "unknown";
    if (parsed.type === "checkout.session.completed") {
      const meta = parsed.data?.object?.metadata as { accountId?: string } | undefined;
      accountId = meta?.accountId ?? (parsed.data?.object?.client_reference_id as string | undefined);
    }
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ received: true, mode: "noop" });
  }

  const db = getDb();
  await db
    .insert(stripeWebhookEvents)
    .values({ id: eventId, type: eventType, payload: JSON.parse(body) as object })
    .onConflictDoNothing();

  if (eventType === "checkout.session.completed" && accountId) {
    await activateSoftwareLicense(accountId, "stripe", customerId);
  }

  return NextResponse.json({ received: true, activated: Boolean(accountId) });
}
