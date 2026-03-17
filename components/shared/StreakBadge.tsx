"use client";

/**
 * StreakBadge — Shows current learning streak with flame icon
 * Loss Aversion: makes users feel they'd lose something by skipping a day
 */

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[var(--yellow)] px-3 py-1.5">
      <span className="text-lg leading-none">🔥</span>
      <span className="font-800 text-sm text-[var(--text-primary)]">{streak} ngày</span>
    </div>
  );
}
