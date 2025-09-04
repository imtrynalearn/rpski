import { Hero } from "@/components/Hero";
import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-12">
      <Hero />

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Private Lesson",
            desc: "One-on-one coaching tailored to your goals.",
            price: "from $120 / hr",
          },
          {
            title: "Group Lesson",
            desc: "Learn together in small groups.",
            price: "$80 / person",
          },
          {
            title: "Kids' Camp",
            desc: "Fun, safe, and confidence-building for ages 6–12.",
            price: "half-day $150",
          },
        ].map((c) => (
          <article key={c.title} className="card p-6">
            <h3 className="text-xl font-medium">{c.title}</h3>
            <p className="mt-2 text-gray-600">{c.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{c.price}</span>
              <Link href="/booking" className="text-ink-900 hover:underline">
                Book
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-medium">Why choose us</h2>
        <ul className="mt-3 grid gap-2 text-gray-600 sm:grid-cols-2">
          <li>Certified, multilingual instructors</li>
          <li>Flexible times and locations</li>
          <li>Clear pricing and easy booking</li>
          <li>Family and group friendly</li>
        </ul>
      </section>
    </div>
  );
}

