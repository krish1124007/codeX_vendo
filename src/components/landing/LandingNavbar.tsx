"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, Inbox } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#footer" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3 text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 shadow-lg shadow-slate-200/40">
            <Sparkles className="h-5 w-5 text-slate-700" />
          </span>
          <span className="text-lg font-semibold tracking-tight">VendorBridge</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-slate-900">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Login
          </Link>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Sign Up
            <Inbox className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-900 transition hover:border-slate-300 hover:bg-slate-200 md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-slate-200 bg-white px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Login
            </Link>
            <Link href="/register" className="rounded-2xl bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700">
              Sign Up
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
