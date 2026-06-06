"use client";

import Link from "next/link";
import { ExternalLink, Globe, Mail } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#footer" },
];

const socials = [
  { label: "Company site", href: "#", icon: Globe },
  { label: "Support", href: "#", icon: Mail },
  { label: "External resources", href: "#", icon: ExternalLink },
];

export default function LandingFooter() {
  return (
    <footer id="footer" className="border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
            VendorBridge
          </p>
          <p className="text-sm leading-7 text-slate-400">
            Seamless procurement orchestration with RFQs, approvals, POs, invoices, and analytics in one premium platform.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Quick links</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Social</h3>
            <div className="flex flex-wrap gap-3">
              {socials.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Contact</h3>
            <p className="text-sm leading-7 text-slate-600">
              Start your vendor management transformation today with a modern procurement hub.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center text-xs text-slate-500 sm:px-8">
        © 2026 VendorBridge. All rights reserved.
      </div>
    </footer>
  );
}
