import Link from "next/link";

export function Hero() {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="grid md:grid-cols-2">
        <div className="p-8 sm:p-12 lg:p-16">
          <h1 className="text-4xl/tight sm:text-5xl font-semibold tracking-tight">
            Ski lessons, simplified.
          </h1>
          <p className="mt-4 text-gray-600">
            Book private and group lessons at the mountain. Expert instructors,
            flexible times, clear pricing.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/booking"
              className="rounded-full bg-ink-900 px-5 py-2.5 text-white hover:bg-ink-700 transition-colors"
            >
              Book a lesson
            </Link>
            <Link
              href="/lessons"
              className="rounded-full border border-gray-300 px-5 py-2.5 hover:bg-gray-100 transition-colors"
            >
              Explore lessons
            </Link>
          </div>
        </div>
        <div className="relative h-64 md:h-auto bg-[url('https://images.unsplash.com/photo-1541625175305-68d4f11fb12a?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
      </div>
    </section>
  );
}

