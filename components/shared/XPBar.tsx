"use client";

/**
 * XPBar — Displays current XP progress toward next level
 * Uses Goal Gradient Effect (starts visually above 0) to encourage completion
 */

interface XPBarProps {
  current: number;
  needed: number;
  level: number;
}

export default function XPBar({ current, needed, level }: XPBarProps) {
  // Artificial minimum of 8% so bar never looks empty (Goal Gradient Effect)
  const rawPercent = Math.min((current / needed) * 100, 100);
  const displayPercent = Math.max(rawPercent, 8);

  return (
    <div className="flex items-center gap-3">
      <span className="font-800 shrink-0 text-sm text-[var(--coral)]">Lv.{level}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${displayPercent}%`,
            background: "linear-gradient(90deg, var(--coral) 0%, var(--yellow) 100%)",
          }}
        />
      </div>
      <span className="font-600 shrink-0 text-xs text-[var(--text-secondary)]">
        {current}/{needed} XP
      </span>
    </div>
  );
}
