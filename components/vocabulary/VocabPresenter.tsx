"use client";

/**
 * VocabPresenter — Displays vocabulary items as interactive flashcards
 * Applies: Serial Position Effect (first item auto-revealed), Cognitive Load reduction (one card at a time)
 */

import { useState, useEffect, useRef } from "react";
import { VocabItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Volume2, VolumeX } from "lucide-react";

interface Props {
  items: VocabItem[];
  topicLabel: string;
  topicEmoji: string;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function VocabPresenter({
  items,
  topicLabel,
  topicEmoji,
  onComplete,
  isCompleted,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [direction, setDirection] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const autoSpeakRef = useRef(autoSpeak);

  // Keep ref in sync so the useEffect always reads the latest value
  autoSpeakRef.current = autoSpeak;

  const current = items[currentIndex];
  const progress = Math.round((seen.size / items.length) * 100);

  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak when card changes (only if autoSpeak is on)
  useEffect(() => {
    if (!autoSpeakRef.current) return;
    // Small delay so the slide animation starts first
    const timer = setTimeout(() => speak(current.japanese), 300);
    return () => clearTimeout(timer);
  }, [currentIndex, current.japanese]);

  const navigate = (dir: number) => {
    const next = currentIndex + dir;
    if (next < 0 || next >= items.length) return;
    setDirection(dir);
    setFlipped(false);
    setCurrentIndex(next);
    setSeen((prev) => new Set([...prev, next]));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-800 text-lg text-[var(--text-primary)]">
          {topicEmoji} {topicLabel}
        </h2>
        <div className="flex items-center gap-2">
          <span className="font-700 text-sm text-[var(--text-secondary)]">
            {currentIndex + 1}/{items.length}
          </span>
          {/* Auto-speak toggle */}
          <button
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              // Speak immediately when turning on
              if (next) speak(current.japanese);
            }}
            title={autoSpeak ? "Tắt tự động đọc" : "Bật tự động đọc"}
            className={`font-700 flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs transition-all duration-200 ${
              autoSpeak
                ? "border-[var(--mint-dark)] bg-[var(--mint)] text-white"
                : "border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--mint)] hover:text-[var(--mint-dark)]"
            }`}
          >
            {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {autoSpeak ? "Tự động" : "Tắt"}
          </button>
        </div>
      </div>

      {/* Progress bar — Zeigarnik Effect */}
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--yellow-dark)" }}
          animate={{ width: `${Math.max(progress, 8)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Flip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: direction * 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -direction * 60, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative"
          style={{ perspective: "1000px" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            className="relative w-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, type: "spring", stiffness: 180 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className="flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-[var(--border)] bg-white p-6 shadow-md"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="font-700 kana-text text-center text-5xl text-[var(--text-primary)]">
                {current.japanese}
              </p>
              <p className="font-600 mt-2 text-sm text-[var(--text-secondary)]">
                {current.reading}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(current.japanese);
                }}
                className="font-700 mt-4 flex items-center gap-1.5 rounded-full bg-[var(--mint)]/10 px-3 py-1.5 text-xs text-[var(--mint-dark)] transition-colors hover:bg-[var(--mint)]/20"
              >
                <Volume2 size={12} />
                Nghe phát âm
              </button>
              <p className="mt-4 text-xs text-gray-400">Nhấn để xem nghĩa</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-[var(--yellow-dark)] bg-[var(--yellow)] p-6"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="font-900 text-center text-3xl text-[var(--text-primary)]">
                {current.meaning}
              </p>
              <p className="font-700 kana-text mt-2 text-base text-[var(--text-secondary)]">
                {current.japanese} ({current.reading})
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          disabled={currentIndex === 0}
          className="font-700 flex flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-[var(--border)] py-3 text-[var(--text-secondary)] transition-colors hover:border-[var(--coral)] hover:text-[var(--coral)] disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Trước
        </button>
        {currentIndex < items.length - 1 ? (
          <button
            onClick={() => navigate(1)}
            className="font-700 flex flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-[var(--coral)] bg-[var(--coral)] py-3 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Tiếp <ChevronRight size={16} />
          </button>
        ) : !isCompleted ? (
          <button
            onClick={onComplete}
            className="font-800 flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-[var(--mint-dark)] bg-[var(--mint)] py-3 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle2 size={16} />
            Hoàn thành! 🎉
          </button>
        ) : (
          <div className="font-700 flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-[var(--mint)] bg-[var(--mint)]/10 py-3 text-[var(--mint-dark)]">
            <CheckCircle2 size={16} />
            Đã xong!
          </div>
        )}
      </div>

      {/* Seen indicator */}
      <p className="font-600 text-center text-xs text-[var(--text-secondary)]">
        Đã xem {seen.size}/{items.length} từ
      </p>
    </div>
  );
}
