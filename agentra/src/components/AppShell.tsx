"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { ProfitTicker } from "./ProfitTicker";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard#settlement", label: "My 24h payout" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/fund", label: "Fund" },
  { href: "/referral", label: "Referrals" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "API" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showTicker = !pathname.startsWith("/how-it-works");

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f5f0]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-white text-teal-800 shadow-sm"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="hidden rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 sm:inline-flex"
            >
              Dashboard
            </Link>
            <button
              type="button"
              className="inline-flex rounded-lg border border-stone-200 bg-white p-2 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-stone-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === item.href
                      ? "bg-teal-50 text-teal-900"
                      : "text-slate-700",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      {showTicker && <ProfitTicker />}

      <footer className="border-t border-stone-200 bg-white px-4 py-6 text-center text-xs text-slate-500 sm:text-sm">
        <p>
          Agentra is non-custodial software. No guaranteed returns.{" "}
          <Link href="/legal/risk" className="underline hover:text-teal-700">
            Risk disclosures
          </Link>
        </p>
      </footer>
    </div>
  );
}
