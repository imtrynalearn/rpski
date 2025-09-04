import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  PAYMENTS_PROVIDER: z.enum(["stripe", "fake"]).default("stripe").optional(),
  NEXT_PUBLIC_PAYMENTS_PROVIDER: z.enum(["stripe", "fake"]).default("stripe").optional(),
  STRIPE_SECRET_KEY: z.string().min(1, "Missing STRIPE_SECRET_KEY").optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  BOOKINGS_FROM_EMAIL: z.string().email().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  PAYMENTS_PROVIDER: process.env.PAYMENTS_PROVIDER,
  NEXT_PUBLIC_PAYMENTS_PROVIDER: process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  BOOKINGS_FROM_EMAIL: process.env.BOOKINGS_FROM_EMAIL,
});
