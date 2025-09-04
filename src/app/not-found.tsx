import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-gray-600">Let’s get you back to the slopes.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink-900 px-5 py-2.5 text-white hover:bg-ink-700 transition-colors">
        Go home
      </Link>
    </div>
  );
}

