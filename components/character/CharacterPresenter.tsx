"use client";

/**
 * CharacterPresenter — Displays kana characters in a grid with flip-card mechanic
 * Supports audio reading via Web Speech API (SpeechSynthesis, ja-JP)
 * Applies: Miller's Law (5 chars per group), Aesthetic-Usability Effect
 */

import { useState, useCallback, useRef } from "react";
import { Character } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface Props {
  characters: Character[];
  groupLabel: string;
  onComplete: () => void;
  isCompleted: boolean;
}

// ── Speech helper ────────────────────────────────────────────────

function speakJa(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ja-JP";
  utt.rate = 0.85;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

// ── Flip Card ───────────────────────────────────────────────────

function FlipCard({
  char,
  index,
  autoSpeak,
}: {
  char: Character;
  index: number;
  autoSpeak: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playSound = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      speakJa(char.kana);
      setPlaying(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPlaying(false), 900);
    },
    [char.kana]
  );

  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next && autoSpeak) playSound();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div
        className="relative h-24 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front — Kana */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[var(--coral-light)] bg-white shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="font-700 kana-text text-3xl text-[var(--text-primary)]">
              {char.kana}
            </span>
            <span className="font-600 mt-1 text-[10px] text-[var(--text-secondary)]">
              Nhấn để xem
            </span>
          </div>

          {/* Back — Romaji + speaker */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[var(--coral)] bg-[var(--coral)] shadow-sm"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="font-900 text-2xl text-white">{char.romaji}</span>
            <span className="kana-text font-600 mt-0.5 text-xs text-white/80">{char.kana}</span>
            {/* Speaker button */}
            <button
              onClick={playSound}
              className={`absolute right-1.5 bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                playing ? "scale-110 bg-white/40" : "bg-white/20 hover:bg-white/40"
              }`}
            >
              <Volume2 size={12} className="text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export default function CharacterPresenter({
  characters,
  groupLabel,
  onComplete,
  isCompleted,
}: Props) {
  const [autoSpeak, setAutoSpeak] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-800 text-lg text-[var(--text-primary)]">{groupLabel}</h2>
          <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">
            {characters.length} ký tự
          </p>
        </div>

        {/* Auto-speak toggle */}
        <button
          onClick={() => setAutoSpeak((v) => !v)}
          className={`font-700 flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs transition-all ${
            autoSpeak
              ? "border-[var(--coral-dark)] bg-[var(--coral)] text-white"
              : "border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--coral)]/50"
          }`}
        >
          {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {autoSpeak ? "Tự đọc: BẬT" : "Tự đọc"}
        </button>
      </div>

      {/* Character grid */}
      <div className="grid grid-cols-5 gap-2">
        {characters.map((char, i) => (
          <FlipCard key={char.kana} char={char} index={i} autoSpeak={autoSpeak} />
        ))}
      </div>

      <p className="font-600 text-center text-sm text-[var(--text-secondary)]">
        {autoSpeak ? "Lật thẻ để nghe phát âm 🔊" : "Nhấn vào thẻ để lật xem phiên âm"}
      </p>

      {/* Complete button */}
      <AnimatePresence>
        {!isCompleted && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="font-800 w-full rounded-2xl py-4 text-base text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--coral)" }}
          >
            Tôi đã nhớ hết! +XP 🎉
          </motion.button>
        )}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--mint)] bg-[var(--mint)]/10 py-4"
          >
            <CheckCircle2 size={20} className="text-[var(--mint-dark)]" />
            <span className="font-700 text-[var(--mint-dark)]">Bài học đã hoàn thành!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isCompleted && (
        <button
          onClick={() => {}}
          className="font-700 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--border)] py-3 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--border)]"
        >
          <RotateCcw size={16} />
          Ôn tập lại
        </button>
      )}
    </div>
  );
}
