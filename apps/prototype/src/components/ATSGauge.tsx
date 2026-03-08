import { motion } from "framer-motion";

interface Props {
  score: number;
}

export default function ATSGauge({ score }: Props) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 54; // r=54
  const offset = circumference - (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 75
      ? "text-green-400"
      : clampedScore >= 50
        ? "text-yellow-400"
        : "text-red-400";

  const strokeColor =
    clampedScore >= 75
      ? "#4ade80"
      : clampedScore >= 50
        ? "#facc15"
        : "#f87171";

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        ATS Score
      </h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            className="text-white/10"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-3xl font-bold ${color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {clampedScore}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
