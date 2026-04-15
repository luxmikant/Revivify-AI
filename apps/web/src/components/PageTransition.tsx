"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { motionTokens, pageTransitionVariants } from "@/lib/motion";

function getPhaseClass(pathname: string) {
  if (pathname.startsWith("/analyze")) return "phase-analyze";
  if (pathname.startsWith("/history")) return "phase-history";
  if (pathname.startsWith("/job-portal")) return "phase-jobs";
  if (pathname.startsWith("/certificate-verification")) return "phase-certificate";
  return "phase-home";
}

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const phaseClass = getPhaseClass(pathname);

  if (shouldReduceMotion) {
    return (
      <div className="page-shell">
        <div className={`page-bg-glow ${phaseClass}`} aria-hidden="true" />
        <div className="page-bg-grain" aria-hidden="true" />
        <div className="page-stage">{children}</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className={`page-bg-glow ${phaseClass}`} aria-hidden="true" />
      <div className="page-bg-grain" aria-hidden="true" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: motionTokens.duration.medium,
            ease: motionTokens.ease.standard,
          }}
          className="page-stage"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
