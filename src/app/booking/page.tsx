import { Suspense } from "react";
import BookingClient from "./BookingClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="max-w-xl">Loading…</div>}>
      <BookingClient />
    </Suspense>
  );
}
