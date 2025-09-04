import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Alpine School — Ski Lessons",
    template: "%s — Alpine School",
  },
  description: "Book private and group ski lessons with top instructors.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        <main className="container py-10 sm:py-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

