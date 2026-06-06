"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Globe,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "RFQ intelligence",
    description: "Manage requests for quotation with supplier briefs, deadlines, and status tracking.",
    icon: ClipboardList,
  },
  {
    title: "Quotation comparison",
    description: "See the smartest supplier offers side-by-side and select the best proposal.",
    icon: BarChart3,
  },
  {
    title: "Approval workflows",
    description: "Multi-level approvals with complete audit history and decision visibility.",
    icon: ShieldCheck,
  },
  {
    title: "Vendor network",
    description: "Organize vendor relationships, ratings, categories, and contact channels.",
    icon: Globe,
  },
  {
    title: "PO & invoice sync",
    description: "Keep purchase orders and invoices connected across the procurement lifecycle.",
    icon: DollarSign,
  },
  {
    title: "Analytics dashboard",
    description: "Track spend, approvals, and vendor performance in real time.",
    icon: Activity,
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="mt-16 scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Features</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Everything procurement teams need to move faster.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Built for modern procurement teams, the landing page showcases the platform’s core value and how the workflow flows from RFQ to invoice.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
            className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40 transition hover:-translate-y-1 hover:bg-slate-50"
          >
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-lg shadow-slate-200/40">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition group-hover:text-slate-900">
              <span>Learn more</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
