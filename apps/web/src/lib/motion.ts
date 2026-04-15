export const motionTokens = {
  duration: {
    micro: 0.14,
    short: 0.24,
    medium: 0.42,
    long: 0.7,
  },
  spring: {
    snappy: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      mass: 0.9,
    },
    smooth: {
      type: "spring" as const,
      stiffness: 180,
      damping: 26,
      mass: 1,
    },
  },
  ease: {
    swiftOut: [0.22, 1, 0.36, 1] as const,
    standard: [0.4, 0, 0.2, 1] as const,
  },
};

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(12px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(10px)",
  },
};
