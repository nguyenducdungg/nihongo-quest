"use client";

/**
 * CelebrationOverlay — Full-screen celebration moment on lesson completion
 * Applies Peak-End Rule: make the "win" moment memorable and delightful
 */

import { motion } from "framer-motion";

interface Props {
  xp: number;
}

export default function CelebrationOverlay({ xp }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(255, 107, 107, 0.15)" }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mx-4 rounded-3xl border-4 border-[var(--coral)] bg-white p-8 text-center shadow-2xl"
      >
        <div className="mb-3 text-6xl">🎉</div>
        <h2 className="font-900 text-2xl text-[var(--text-primary)]">Tuyệt vời!</h2>
        <p className="font-600 mt-1 text-[var(--text-secondary)]">Bài học hoàn thành</p>
        <div className="font-900 mt-4 inline-block rounded-full bg-[var(--yellow)] px-6 py-2 text-xl text-[var(--text-primary)]">
          +{xp} XP ⭐
        </div>
      </motion.div>
    </motion.div>
  );
}
