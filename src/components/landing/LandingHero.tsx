"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Layers, ShieldCheck, Sparkles } from "lucide-react";

export default function LandingHero() {
  return (
    <section id="home" className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-12 lg:p-16">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="mx-auto max-w-4xl text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm shadow-slate-300/30 backdrop-blur">
          <Sparkles className="h-4 w-4 text-slate-700" />
          <span>Modern procurement operations for startups and enterprises.</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Spend smarter. Source faster. Scale procurement.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-xl">
          VendorBridge centralizes RFQs, quotations, approvals, purchase orders, and vendor analytics into one premium control plane.
          Build trust with your suppliers, accelerate approvals, and keep every procurement decision visible.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="min-w-[170px] bg-slate-800 text-white shadow-lg shadow-slate-800/15 hover:bg-slate-700">
              Login
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="min-w-[170px] border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100">
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Top-tier security", icon: ShieldCheck, detail: "RBAC guardrails across every workflow." },
            { title: "Live collaboration", icon: Layers, detail: "Supplier intelligence and approval context." },
            { title: "Fast execution", icon: ArrowRight, detail: "Rapid RFQ to PO conversion in one place." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm shadow-slate-200/40 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
