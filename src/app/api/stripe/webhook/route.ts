import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) break;

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "paid",
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        },
        include: { items: { include: { timeSlot: { include: { lessonType: true } } } } },
      });

      // Increment booked count for each item (simple approach)
      for (const item of updated.items) {
        await prisma.timeSlot.update({
          where: { id: item.timeSlotId },
          data: { bookedCount: { increment: item.students } },
        });
      }

      // Email confirmation
      const firstItem = updated.items[0];
      if (firstItem) {
        const dt = new Date(firstItem.timeSlot.start);
        const dateTime = dt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
        await sendBookingConfirmation({
          to: updated.customerEmail,
          name: updated.customerName,
          bookingId: updated.id,
          dateTime,
          lessonName: firstItem.timeSlot.lessonType.name,
          total: `$${(updated.totalCents / 100).toFixed(2)}`,
        });
      }
      break;
    }
    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const session = (event.data.object as any);
      const bookingId = session?.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.update({ where: { id: bookingId }, data: { status: "canceled" } });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

