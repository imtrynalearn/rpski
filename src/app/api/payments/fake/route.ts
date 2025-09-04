import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";

const CardSchema = z.object({
  bookingId: z.string().min(1),
  number: z.string().min(12).max(19),
  expMonth: z.coerce.number().int().min(1).max(12),
  expYear: z.coerce.number().int().min(new Date().getFullYear()).max(2100),
  cvc: z.string().min(3).max(4),
  name: z.string().min(1),
});

function luhnValid(num: string) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectBrand(num: string) {
  if (/^4\d{12,18}$/.test(num)) return "visa";
  if (/^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01])\d{12})$/.test(num)) return "mastercard";
  if (/^3[47]\d{13}$/.test(num)) return "amex";
  return "card";
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const body = CardSchema.safeParse(raw);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid card data" }, { status: 400 });
  }
  const { bookingId, number, expMonth, expYear, name } = body.data;

  // Validate using Luhn; never store full PAN or CVC
  const digits = number.replace(/\s|-/g, "");
  if (!/^[0-9]+$/.test(digits) || !luhnValid(digits)) {
    return NextResponse.json({ error: "Invalid card number" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { items: { include: { timeSlot: { include: { lessonType: true } } } } },
  });
  if (!booking || booking.status !== "pending") {
    return NextResponse.json({ error: "Booking not found or not payable" }, { status: 400 });
  }

  // Store only minimal non-sensitive metadata
  const last4 = digits.slice(-4);
  const brand = detectBrand(digits);

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "fake",
      cardBrand: brand,
      cardLast4: last4,
      expMonth,
      expYear,
    },
  });

  // Mark booking paid and increment capacity
  await prisma.booking.update({ where: { id: booking.id }, data: { status: "paid" } });
  for (const item of booking.items) {
    await prisma.timeSlot.update({
      where: { id: item.timeSlotId },
      data: { bookedCount: { increment: item.students } },
    });
  }

  const firstItem = booking.items[0];
  if (firstItem) {
    const dt = new Date(firstItem.timeSlot.start);
    const dateTime = dt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    await sendBookingConfirmation({
      to: booking.customerEmail,
      name,
      bookingId: booking.id,
      dateTime,
      lessonName: firstItem.timeSlot.lessonType.name,
      total: `$${(booking.totalCents / 100).toFixed(2)}`,
    });
  }

  return NextResponse.json({ ok: true });
}

