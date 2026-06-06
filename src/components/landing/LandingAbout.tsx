"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock3, LayoutGrid, Users } from "lucide-react";

const aboutPoints = [
  { title: "Built for velocity", description: "From RFQ creation to PO issuance, every step is designed for speed and clarity." },
  { title: "Trusted visibility", description: "Approval permissions, audit trails, and vendor performance are visible in one place." },
  { title: "Modern operations", description: "A premium workspace with clean layouts, motion, and polished controls." },
];

export default function LandingAbout() {
  return (
    <section id="about" className="mt-20 scroll-mt-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.08)]"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">About</p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            The dashboard experience procurement teams actually want.
          </h2>
          <p className="mt-6 text-base leading-8 text-slate-600">
            VendorBridge blends modern design with enterprise procurement workflows. It’s a unified workspace for procurement officers, managers, finance, and vendor teams.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {aboutPoints.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900">
                  <Clock3 className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3 text-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-lg shadow-slate-200/40">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Effortless workflow control</p>
                <p className="text-sm text-slate-400">Organize every negotiation, decision, and invoice from a single interface.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-100 p-6">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Approval progress</span>
                <span className="font-semibold text-slate-900">81%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-white" />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-200/40">
            <div className="mb-4 flex items-center gap-3 text-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-lg shadow-slate-200/40">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">One source of truth</p>
                <p className="text-sm text-slate-400">Vendors, RFQs, quotations, approvals and invoices are connected in a single data model.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-600">Integrations and exports are easy to add once your team is live.</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <ArrowRight className="h-4 w-4" />
                <span>Designed for modern procurement operations</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
