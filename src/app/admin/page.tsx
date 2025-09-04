import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  if (!env.DATABASE_URL) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin (demo)</h1>
        <p className="text-sm text-red-600">Database not configured. Set <code>DATABASE_URL</code> in your environment (e.g., .env or Vercel Project Settings) and reload.</p>
      </div>
    );
  }
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { items: { include: { timeSlot: { include: { lessonType: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin (demo)</h1>
      <p className="text-sm text-gray-600">Protect this route with Auth.js in production.</p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Booking</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Lesson</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const item = b.items[0];
              const dt = item ? new Date(item.timeSlot.start).toLocaleString() : "-";
              const lesson = item?.timeSlot.lessonType.name ?? "-";
              return (
                <tr key={b.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{b.id}</td>
                  <td className="p-3">{b.customerName}<br/><span className="text-gray-500">{b.customerEmail}</span></td>
                  <td className="p-3">{b.status}</td>
                  <td className="p-3">{lesson}</td>
                  <td className="p-3">{dt}</td>
                  <td className="p-3">${(b.totalCents / 100).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
