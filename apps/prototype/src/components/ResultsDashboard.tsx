import { motion } from "framer-motion";
import ATSGauge from "./ATSGauge";
import HiddenStrengths from "./HiddenStrengths";
import BridgePlan from "./BridgePlan";
import MissingKeywords from "./MissingKeywords";
import type { AnalysisResult } from "../../../../packages/shared/src/types";

interface Props {
  result: AnalysisResult;
}

export default function ResultsDashboard({ result }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Top row: ATS gauge + missing keywords */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-center">
          <ATSGauge score={result.ats_score} />
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <MissingKeywords keywords={result.missing_keywords} />
        </div>
      </div>

      {/* Hidden Strengths */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <HiddenStrengths
          items={result.gap_analysis}
          summary={result.hidden_strengths_summary}
        />
      </div>

      {/* Bridge Plan */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <BridgePlan items={result.bridge_plan} />
      </div>
    </motion.div>
  );
}
