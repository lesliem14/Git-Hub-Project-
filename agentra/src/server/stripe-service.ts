import Stripe from "stripe";
import { LICENSE_FEE_USDT } from "@/lib/constants";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createLicenseCheckoutSession(input: {
  accountId: string;
  email: string;
  origin: string;
}): Promise<{ url: string; sessionId: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe not configured" };
  }

  const priceId = process.env.STRIPE_LICENSE_PRICE_ID;
  const successUrl = `${input.origin}/dashboard?license=stripe_success`;
  const cancelUrl = `${input.origin}/pricing?license=canceled`;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(LICENSE_FEE_USDT * 100),
            product_data: {
              name: "Agentra software license",
              description: `${LICENSE_FEE_USDT} USDT equivalent · non-withdrawable trading credit included`,
            },
          },
          quantity: 1,
        },
      ];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    client_reference_id: input.accountId,
    metadata: { accountId: input.accountId },
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) return { error: "Could not create checkout URL" };
  return { url: session.url, sessionId: session.id };
}

export function constructStripeEvent(body: string, signature: string): Stripe.Event | null {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return null;
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return null;
  }
}
