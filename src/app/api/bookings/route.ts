import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

const BookingRequest = z.object({
  type: z.string().min(1), // lesson type name ("Private Lesson", etc.)
  date: z.string().min(1), // YYYY-MM-DD
  time: z.string().min(1), // HH:MM
  students: z.coerce.number().int().min(1).max(6),
  level: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = BookingRequest.parse(json);
    const provider = env.PAYMENTS_PROVIDER ?? "stripe";

    // Find the lesson type
    const lessonType = await prisma.lessonType.findFirst({
      where: { name: data.type, active: true },
    });
    if (!lessonType) {
      return NextResponse.json({ error: "Lesson type not found" }, { status: 400 });
    }

    // Compose Date from date + time
    const start = new Date(`${data.date}T${data.time}:00`);
    const end = new Date(start.getTime() + lessonType.durationMin * 60000);

    // Find or create a matching time slot (MVP behavior)
    let timeSlot = await prisma.timeSlot.findFirst({
      where: { lessonTypeId: lessonType.id, start },
    });
    if (!timeSlot) {
      timeSlot = await prisma.timeSlot.create({
        data: {
          lessonTypeId: lessonType.id,
          start,
          end,
          capacity: lessonType.groupMax ?? 2,
        },
      });
    }

    // Basic capacity check (MVP; for robust handling use serializable transactions)
    const remaining = timeSlot.capacity - timeSlot.bookedCount;
    if (remaining < data.students) {
      return NextResponse.json({ error: "Slot is full or insufficient capacity" }, { status: 409 });
    }

    // Create pending booking and item
    const totalCents = lessonType.basePriceCents * data.students;
    const booking = await prisma.booking.create({
      data: {
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        notes: data.notes,
        totalCents,
        currency: "usd",
        status: "pending",
        items: {
          create: [{ timeSlotId: timeSlot.id, students: data.students, level: data.level }],
        },
      },
    });

    // Fake payments path: client will collect card details and call /api/payments/fake
    if (provider === "fake") {
      return NextResponse.json({ provider: "fake", bookingId: booking.id }, { status: 200 });
    }

    // Stripe path
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    const success = `${env.NEXT_PUBLIC_BASE_URL}/booking?success=1&booking=${booking.id}`;
    const cancel = `${env.NEXT_PUBLIC_BASE_URL}/booking?canceled=1&booking=${booking.id}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: success,
      cancel_url: cancel,
      metadata: { bookingId: booking.id },
      customer_email: data.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: totalCents,
            product_data: {
              name: `${lessonType.name} (${data.students} student${data.students > 1 ? "s" : ""})`,
              description: `${lessonType.durationMin} min`,
            },
          },
        },
      ],
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 400 });
  }
}
