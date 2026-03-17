"use client";

/**
 * QuizPresenter — Multiple-choice quiz UI
 * Behavior: correct → auto-advance after 700ms | wrong → shake + retry (đáp án sai bị khóa)
 * Applies: Immediate feedback (Doherty Threshold), Goal Gradient (progress bar)
 */

import { useState, useEffect, useRef } from "react";
import { QuizQuestion } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export default function QuizPresenter({ questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Choices tried and confirmed wrong for the current question
  const [wrongAttempts, setWrongAttempts] = useState<Set<string>>(new Set());
  // The last wrong choice selected (used to trigger shake animation)
  const [shakingChoice, setShakingChoice] = useState<string | null>(null);
  // Whether the correct answer has been selected (locks all buttons)
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const goNext = (currentScore: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      onComplete(currentScore);
      return;
    }
    setCurrentIndex(nextIndex);
    setWrongAttempts(new Set());
    setShakingChoice(null);
    setSolved(false);
  };

  const handleSelect = (choice: string) => {
    // Block if already solved or this choice was already tried
    if (solved || wrongAttempts.has(choice)) return;

    if (choice === question.answer) {
      // Correct — count only if no wrong attempts (first-try bonus)
      const newScore = wrongAttempts.size === 0 ? score + 1 : score;
      setSolved(true);
      setScore(newScore);
      // Auto-advance after 700ms
      autoAdvanceTimer.current = setTimeout(() => goNext(newScore), 700);
    } else {
      // Wrong — shake and lock that choice, allow retry
      setWrongAttempts((prev) => new Set([...prev, choice]));
      setShakingChoice(choice);
      setTimeout(() => setShakingChoice(null), 400);
    }
  };

  const getChoiceStyle = (choice: string): string => {
    if (solved && choice === question.answer)
      return "border-[var(--mint-dark)] bg-[var(--mint)]/15 scale-[1.02]";
    if (solved) return "border-[var(--border)] bg-white opacity-40 cursor-default";
    if (wrongAttempts.has(choice)) return "border-red-300 bg-red-50 opacity-60 cursor-not-allowed";
    return "border-[var(--border)] bg-white hover:border-[var(--coral)] hover:bg-[var(--coral-light)] cursor-pointer";
  };

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="font-700 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            Câu {currentIndex + 1}/{questions.length}
          </span>
          <span>{score} đúng</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--border)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--coral), var(--yellow))" }}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border-2 border-[var(--border)] bg-white p-6 text-center shadow-sm"
        >
          <p className="font-700 mb-3 text-xs tracking-wider text-[var(--text-secondary)] uppercase">
            {question.type === "kana-to-romaji"
              ? "Phiên âm ký tự này là gì?"
              : question.type === "romaji-to-kana"
                ? "Chọn kana đúng"
                : "Nghĩa của từ này là gì?"}
          </p>
          <p className="font-700 kana-text text-5xl text-[var(--text-primary)]">
            {question.prompt}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Wrong answer hint */}
      <AnimatePresence>
        {wrongAttempts.size > 0 && !solved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-700 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600"
          >
            <XCircle size={15} />
            Sai rồi! Thử lại nhé 💪
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-2.5">
        {question.choices.map((choice) => (
          <motion.button
            key={choice}
            onClick={() => handleSelect(choice)}
            animate={shakingChoice === choice ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className={`font-700 kana-text relative rounded-2xl border-2 px-3 py-4 text-sm transition-all duration-150 ${getChoiceStyle(choice)}`}
          >
            {choice}
            {solved && choice === question.answer && (
              <CheckCircle2
                size={16}
                className="absolute top-1.5 right-1.5 text-[var(--mint-dark)]"
              />
            )}
            {wrongAttempts.has(choice) && (
              <XCircle size={16} className="absolute top-1.5 right-1.5 text-red-400" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Correct feedback (auto-advances, no button needed) */}
      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-700 flex items-center justify-center gap-2 rounded-2xl border border-[var(--mint-dark)]/30 bg-[var(--mint)]/15 px-4 py-3 text-sm text-[var(--mint-dark)]"
          >
            <CheckCircle2 size={16} />
            {wrongAttempts.size === 0 ? "Hoàn hảo! 🎉" : "Đúng rồi! ✓"}
            <span className="ml-1 text-xs opacity-70">Tự chuyển câu tiếp…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
