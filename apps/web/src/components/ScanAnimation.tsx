"use client";

import { motion } from "framer-motion";

const messages = [
  "Parsing your resume…",
  "Analyzing job description…",
  "Scoring ATS compatibility…",
  "Discovering hidden strengths…",
  "Building your bridge plan…",
];

export default function ScanAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-rose-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-amber-400"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-600 to-amber-500"
          animate={{ scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      <div className="h-6 overflow-hidden">
        <motion.div
          animate={{ y: [0, -24, -48, -72, -96, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          {messages.map((m) => (
            <p
              key={m}
              className="h-6 text-sm text-slate-300 text-center leading-6"
            >
              {m}
            </p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
