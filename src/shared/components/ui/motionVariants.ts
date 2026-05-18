export const fadeInDown = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0 },
} as const;

export const staffFadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
} as const;

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
} as const;
