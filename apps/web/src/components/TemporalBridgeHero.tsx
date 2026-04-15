"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

type TemporalBridgeHeroProps = {
  isSignedIn: boolean;
};

export default function TemporalBridgeHero({ isSignedIn }: TemporalBridgeHeroProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, {
    stiffness: 160,
    damping: 28,
    mass: 0.45,
  });

  const blur = useTransform(smoothVelocity, (value) =>
    Math.min(14, Math.abs(value) / 100)
  );
  const brightness = useTransform(smoothVelocity, (value) =>
    1 + Math.min(0.42, Math.abs(value) / 1300)
  );

  const threadProgress = useTransform(scrollYProgress, [0.04, 0.88], [0, 1]);
  const threadProgressLate = useTransform(scrollYProgress, [0.12, 0.95], [0, 1]);

  const leftShift = useTransform(scrollYProgress, [0, 1], [0, -52]);
  const rightShift = useTransform(scrollYProgress, [0, 1], [0, 52]);
  const chasmWidth = useTransform(scrollYProgress, [0, 1], [72, 196]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [0.14, 0.48, 0.64]);

  const visualFilter = useMotionTemplate`blur(${blur}px) brightness(${brightness})`;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#09090b]/75 px-7 pb-12 pt-16 md:px-12 md:pb-16 md:pt-20"
    >
      <motion.div
        className="absolute inset-0"
        style={shouldReduceMotion ? undefined : { filter: visualFilter }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-y-[-22%] left-1/2 h-[144%] -translate-x-1/2 -rotate-[17deg] bg-gradient-to-b from-black/0 via-black/80 to-black/0"
          style={shouldReduceMotion ? { width: 120 } : { width: chasmWidth }}
        />

        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(251,191,36,0.22),transparent_48%)]"
          style={shouldReduceMotion ? { opacity: 0.3 } : { opacity: glowOpacity }}
        />

        <motion.div
          className="absolute -left-20 top-0 h-full w-[54%] bg-gradient-to-r from-rose-800/28 to-transparent"
          style={shouldReduceMotion ? undefined : { x: leftShift }}
        />
        <motion.div
          className="absolute -right-20 top-0 h-full w-[54%] bg-gradient-to-l from-amber-700/22 to-transparent"
          style={shouldReduceMotion ? undefined : { x: rightShift }}
        />

        <svg
          viewBox="0 0 1200 420"
          className="pointer-events-none absolute inset-x-0 top-[20%] h-[60%] w-full"
          fill="none"
        >
          <motion.path
            d="M60 322 C 242 108, 454 388, 638 192 C 770 54, 928 250, 1140 120"
            stroke="rgba(251, 113, 133, 0.88)"
            strokeWidth="3"
            strokeLinecap="round"
            style={shouldReduceMotion ? { pathLength: 1 } : { pathLength: threadProgress }}
          />
          <motion.path
            d="M50 240 C 240 46, 440 340, 616 138 C 792 -26, 942 202, 1132 72"
            stroke="rgba(251, 191, 36, 0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={shouldReduceMotion ? { pathLength: 1 } : { pathLength: threadProgressLate }}
          />
          <motion.path
            d="M86 372 C 264 198, 472 440, 654 236 C 826 88, 980 294, 1162 178"
            stroke="rgba(253, 186, 116, 0.76)"
            strokeWidth="2"
            strokeLinecap="round"
            style={shouldReduceMotion ? { pathLength: 1 } : { pathLength: threadProgress }}
          />
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-rose-200/75">
          Temporal Bridge
        </p>

        <h2 className="text-balance text-4xl font-extrabold leading-[1.08] text-white md:text-6xl">
          Scroll To Weave Your
          <span className="block bg-gradient-to-r from-rose-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">
            Career Comeback Story
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          Your scroll isn&apos;t decoration. It physically bridges the gap between where you paused and
          where you are heading next, using your own profile context to build momentum.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Start Distillation <ArrowRight size={16} />
              </Link>
              <Link
                href="/job-portal"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Explore Opportunities
              </Link>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                Enter The Platform <ArrowRight size={16} />
              </button>
            </SignInButton>
          )}
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-slate-400">
          Scroll velocity changes bridge intensity in real time
        </p>
      </div>
    </section>
  );
}
