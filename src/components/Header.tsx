"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/booking", label: "Book" },
  { href: "/policies", label: "Policies" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Alpine School
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "transition-colors duration-fast ease-smooth " +
                  (active ? "text-ink-900" : "text-ink-500 hover:text-ink-900")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/booking"
            className="rounded-full bg-ink-900 px-4 py-2 text-white hover:bg-ink-700 transition-colors duration-fast ease-smooth"
          >
            Book now
          </Link>
        </nav>
      </div>
    </header>
  );
}

