"use client";

import { motion } from "framer-motion";

export default function LoadingAnimation() {
  return (
    <div className="mb-10 flex items-center justify-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm">
      <span className="font-medium text-foreground">Live procurement sync</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12 }}
            className="block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary/50 to-primary"
          />
        ))}
      </div>
    </div>
  );
}
