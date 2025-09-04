"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const USE_FAKE = process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER === "fake";

export default function BookingClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const params = useSearchParams();
  const success = params.get("success");
  const canceled = params.get("canceled");

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      type: String(formData.get("type") || ""),
      date: String(formData.get("date") || ""),
      time: String(formData.get("time") || ""),
      students: Number(formData.get("students") || 1),
      level: formData.get("level") ? String(formData.get("level")) : undefined,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: formData.get("phone") ? String(formData.get("phone")) : undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    };
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");
      if (data.url) {
        window.location.href = data.url as string;
      } else if (data.provider === "fake" && data.bookingId) {
        setBookingId(String(data.bookingId));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onFakePay = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/payments/fake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      window.location.href = `/booking?success=1&booking=${bookingId}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const banner = useMemo(() => {
    if (success) return { color: "bg-green-50 border-green-200", text: "Payment successful. See you on the mountain!" };
    if (canceled) return { color: "bg-yellow-50 border-yellow-200", text: "Payment canceled. You can try again." };
    return null;
  }, [success, canceled]);

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Book a lesson</h1>
      <p className="mt-2 text-gray-600">Secure checkout powered by Stripe.</p>

      {banner && (
        <div className={`mt-6 rounded-xl border p-4 text-sm ${banner.color}`}>{banner.text}</div>
      )}

      {!bookingId && (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium">
                Lesson type
              </label>
              <select id="type" name="type" className="mt-1 w-full rounded-lg border border-gray-300 p-2">
                <option>Private Lesson</option>
                <option>Group Lesson</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium">
                Date
              </label>
              <input id="date" name="date" type="date" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium">
                Time
              </label>
              <input id="time" name="time" type="time" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
            </div>
            <div>
              <label htmlFor="students" className="block text-sm font-medium">
                Students
              </label>
              <input id="students" name="students" type="number" min={1} max={6} defaultValue={1} className="mt-1 w-full rounded-lg border border-gray-300 p-2" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="level" className="block text-sm font-medium">
                Level
              </label>
              <select id="level" name="level" className="mt-1 w-full rounded-lg border border-gray-300 p-2">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Contact name
              </label>
              <input id="name" name="name" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input id="email" name="email" type="email" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone
              </label>
              <input id="phone" name="phone" type="tel" className="mt-1 w-full rounded-lg border border-gray-300 p-2" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea id="notes" name="notes" rows={4} className="mt-1 w-full rounded-lg border border-gray-300 p-2" placeholder="Anything we should know?" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button disabled={loading} type="submit" className="rounded-full bg-ink-900 px-5 py-2.5 text-white hover:bg-ink-700 transition-colors disabled:opacity-60">
              {loading ? "Processing..." : USE_FAKE ? "Continue" : "Continue to payment"}
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </form>
      )}

      {USE_FAKE && bookingId && (
        <form onSubmit={onFakePay} className="mt-8 space-y-6">
          <div className="rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-medium">Payment details</h2>
            <p className="mt-1 text-sm text-gray-600">Test mode. Do not enter real card numbers.</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="number" className="block text-sm font-medium">Card number</label>
                <input id="number" name="number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expMonth" className="block text-sm font-medium">Exp. month</label>
                  <input id="expMonth" name="expMonth" type="number" min={1} max={12} className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
                </div>
                <div>
                  <label htmlFor="expYear" className="block text-sm font-medium">Exp. year</label>
                  <input id="expYear" name="expYear" type="number" min={new Date().getFullYear()} max={2100} className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium">CVC</label>
                  <input id="cvc" name="cvc" type="password" inputMode="numeric" autoComplete="cc-csc" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">Name on card</label>
                  <input id="name" name="name" className="mt-1 w-full rounded-lg border border-gray-300 p-2" required />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button disabled={loading} type="submit" className="rounded-full bg-ink-900 px-5 py-2.5 text-white hover:bg-ink-700 transition-colors disabled:opacity-60">
                {loading ? "Processing..." : "Pay now"}
              </button>
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

