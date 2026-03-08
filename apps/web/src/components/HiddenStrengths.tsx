"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface GapItem {
  gap_period: string;
  hidden_strength: string;
  mapped_skill: string;
}

interface Props {
  items: GapItem[];
  summary: string;
}

export default function HiddenStrengths({ items, summary }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Hidden Strengths
        </h3>
      </div>

      {summary && (
        <p className="text-sm text-slate-300 italic leading-relaxed">
          {summary}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-1"
          >
            <p className="text-xs text-slate-500">{item.gap_period}</p>
            <p className="text-sm text-rose-300 font-medium">
              {item.hidden_strength}
            </p>
            <p className="text-xs text-slate-400">
              Mapped skill:{" "}
              <span className="text-amber-300 font-medium">
                {item.mapped_skill}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
