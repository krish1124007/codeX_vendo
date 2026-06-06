"use client";

import { motion } from "framer-motion";

export default function LoadingAnimation() {
  return (
    <div className="mb-10 flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm">
      <span className="font-medium text-slate-700">Live procurement sync</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12 }}
            className="block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-white/80 to-slate-300/80"
          />
        ))}
      </div>
    </div>
  );
}
