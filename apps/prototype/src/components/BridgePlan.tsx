import { motion } from "framer-motion";
import { Route } from "lucide-react";

interface PlanItem {
  action: string;
  time_estimate: string;
  resource: string;
}

interface Props {
  items: PlanItem[];
}

export default function BridgePlan({ items }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Route size={18} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Bridge Plan
        </h3>
      </div>

      <ol className="space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex gap-3 rounded-xl bg-white/5 border border-white/10 p-4"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-xs font-bold flex-shrink-0">
              {i + 1}
            </span>
            <div className="space-y-1">
              <p className="text-sm text-slate-200 font-medium">
                {item.action}
              </p>
              <p className="text-xs text-slate-400">
                <span className="text-emerald-300">{item.time_estimate}</span>
                {item.resource && <> · {item.resource}</>}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
