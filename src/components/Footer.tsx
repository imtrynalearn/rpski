export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container py-8 text-xs text-gray-400 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Alpine School</p>
        <div className="flex gap-4">
          <a href="/policies" className="hover:text-ink-900 transition-colors">Policies</a>
          <a href="#" className="hover:text-ink-900 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

