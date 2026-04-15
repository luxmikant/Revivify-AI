"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor='active']";

export default function InteractiveCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);

  const smoothX = useSpring(pointerX, {
    stiffness: 520,
    damping: 38,
    mass: 0.35,
  });
  const smoothY = useSpring(pointerY, {
    stiffness: 520,
    damping: 38,
    mass: 0.35,
  });

  const ringX = useSpring(pointerX, {
    stiffness: 360,
    damping: 34,
    mass: 0.6,
  });
  const ringY = useSpring(pointerY, {
    stiffness: 360,
    damping: 34,
    mass: 0.6,
  });

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.setAttribute("data-cursor", "custom");

    const onMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR);

      setVisible(true);

      if (interactive) {
        const rect = interactive.getBoundingClientRect();
        pointerX.set(rect.left + rect.width / 2);
        pointerY.set(rect.top + rect.height / 2);
        setActive(true);
        return;
      }

      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      setActive(false);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      document.documentElement.removeAttribute("data-cursor");
    };
  }, [enabled, pointerX, pointerY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full bg-rose-300/80 mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: active ? 16 : 8,
          height: active ? 16 : 8,
          opacity: visible ? 0.95 : 0,
          filter: active ? "blur(1px)" : "blur(0px)",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.4 }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[89] rounded-full border border-amber-200/70"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: active ? 64 : 30,
          height: active ? 64 : 30,
          opacity: visible ? 0.8 : 0,
          backgroundColor: active ? "rgba(251, 191, 36, 0.12)" : "rgba(251, 191, 36, 0.04)",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.7 }}
      />
    </>
  );
}
