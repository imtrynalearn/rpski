import { env } from "@/lib/env";
import { Resend } from "resend";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendBookingConfirmation(params: {
  to: string;
  name: string;
  bookingId: string;
  dateTime: string;
  lessonName: string;
  total: string;
}) {
  if (!resend || !env.BOOKINGS_FROM_EMAIL) return;
  await resend.emails.send({
    from: env.BOOKINGS_FROM_EMAIL,
    to: params.to,
    subject: `Your booking ${params.bookingId} is confirmed`,
    text: `Hi ${params.name},\n\nYour ${params.lessonName} on ${params.dateTime} is confirmed. Total: ${params.total}.\n\nSee you on the mountain!`,
  });
}

