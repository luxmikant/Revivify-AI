import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  keywords: string[];
}

export default function MissingKeywords({ keywords }: Props) {
  if (!keywords.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Missing Keywords
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <motion.span
            key={kw}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-medium"
          >
            {kw}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
