"use client";

/**
 * QuizResultPresenter — Shows final score with celebration moment
 * Applies Peak-End Rule: make the end screen memorable and rewarding
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

interface Props {
  score: number;
  total: number;
  xpEarned: number;
  onRetry: () => void;
}

export default function QuizResultPresenter({ score, total, xpEarned, onRetry }: Props) {
  const percentage = Math.round((score / total) * 100);
  const isPerfect = score === total;
  const isGood = percentage >= 70;

  const emoji = isPerfect ? "🏆" : isGood ? "⭐" : "💪";
  const message = isPerfect
    ? "Hoàn hảo! Bạn thật xuất sắc!"
    : isGood
      ? "Làm tốt lắm! Tiếp tục phát huy!"
      : "Luyện tập thêm nhé, bạn sẽ làm được!";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="space-y-5"
    >
      {/* Score card */}
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-8 text-center shadow-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="mb-4 text-7xl"
        >
          {emoji}
        </motion.div>
        <h2 className="font-900 text-2xl text-[var(--text-primary)]">{message}</h2>
        <div className="mt-5 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-900 text-4xl text-[var(--coral)]">
              {score}/{total}
            </p>
            <p className="font-600 text-sm text-[var(--text-secondary)]">Câu đúng</p>
          </div>
          <div className="h-12 w-px bg-[var(--border)]" />
          <div className="text-center">
            <p className="font-900 text-4xl text-[var(--yellow-dark)]">{percentage}%</p>
            <p className="font-600 text-sm text-[var(--text-secondary)]">Tỉ lệ đúng</p>
          </div>
        </div>

        {xpEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-800 mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--yellow)] px-5 py-2 text-[var(--text-primary)]"
          >
            ⭐ +{xpEarned} XP kiếm được!
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <button
          onClick={onRetry}
          className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral)] bg-[var(--coral)] py-3.5 text-white transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          <RotateCcw size={16} />
          Làm lại quiz
        </button>
        <Link
          href="/"
          className="font-700 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--border)] bg-white py-3.5 text-[var(--text-primary)] transition-colors hover:border-[var(--coral)]"
        >
          <Home size={16} />
          Về trang chủ
        </Link>
      </div>
    </motion.div>
  );
}
