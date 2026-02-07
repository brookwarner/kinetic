import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { GlobalResetButton } from "@/components/global-reset-button";

export const metadata: Metadata = {
  title: "Referral Routing - Kinetic",
  description: "Quality-based physiotherapist referral routing within the Kinetic platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))]/50 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--kinetic-wine))] to-[hsl(var(--kinetic-burgundy-dark))] shadow-sm">
                    <span className="text-lg font-bold text-white">K</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold leading-none text-[hsl(var(--foreground))]">
                      Kinetic
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Referral Routing
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <GlobalResetButton />
                <Link
                  href="/demo"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--kinetic-wine))]"
                >
                  Demo
                </Link>
                <Link
                  href="/"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--kinetic-wine))]"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
