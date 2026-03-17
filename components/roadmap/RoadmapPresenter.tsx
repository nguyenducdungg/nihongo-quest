"use client";

/**
 * RoadmapPresenter — Pure UI for the lesson roadmap
 * Renders lesson nodes in a winding path layout (Duolingo-style)
 * Applies Von Restorff Effect: next lesson node visually pops
 */

import { LessonUnit } from "@/types";
import Link from "next/link";
import { Lock, CheckCircle2, ChevronRight } from "lucide-react";

interface Props {
  lessons: LessonUnit[];
  completedIds: Set<string>;
  totalXP: number;
}

function getLessonHref(lesson: LessonUnit): string {
  if (lesson.type === "quiz") return `/quiz?lesson=${lesson.id}`;
  if (lesson.type === "vocabulary") return `/learn/vocabulary?topic=${lesson.topicKey}`;
  return `/learn/${lesson.type}?group=${lesson.topicKey}`;
}

function getLevelColor(level: number) {
  const colors: Record<number, { bg: string; border: string; text: string }> = {
    1: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    2: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    3: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
    4: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  };
  return colors[level] ?? colors[1];
}

export default function RoadmapPresenter({ lessons, completedIds, totalXP }: Props) {
  const nextLessonIndex = lessons.findIndex((l) => !completedIds.has(l.id));

  // Group lessons by level
  const byLevel = lessons.reduce<Record<number, LessonUnit[]>>((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {});

  const levelLabels: Record<number, string> = {
    1: "Level 1 — Khởi đầu",
    2: "Level 2 — Phát triển",
    3: "Level 3 — Âm đục & nửa đục (濁音)",
    4: "Level 4 — Âm ghép & Chuẩn bị N5 (拗音)",
  };

  return (
    <div className="space-y-8">
      {Object.entries(byLevel).map(([lvlStr, lvlLessons]) => {
        const lvl = Number(lvlStr);
        const colorScheme = getLevelColor(lvl);

        return (
          <section key={lvl}>
            <div
              className={`font-700 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${colorScheme.bg} ${colorScheme.border} border ${colorScheme.text}`}
            >
              <span>{levelLabels[lvl]}</span>
            </div>

            <div className="space-y-3">
              {lvlLessons.map((lesson, idx) => {
                const globalIndex = lessons.indexOf(lesson);
                const isDone = completedIds.has(lesson.id);
                const isNext = globalIndex === nextLessonIndex;
                const isLocked = !isDone && !isNext && globalIndex > nextLessonIndex;

                return (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    isDone={isDone}
                    isNext={isNext}
                    isLocked={isLocked}
                    index={idx}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="py-6 text-center text-sm text-[var(--text-secondary)]">
        <span className="mb-2 block text-2xl">🎌</span>
        Tổng XP tích lũy: <strong className="text-[var(--coral)]">{totalXP} XP</strong>
      </div>
    </div>
  );
}

function LessonNode({
  lesson,
  isDone,
  isNext,
  isLocked,
  index,
}: {
  lesson: LessonUnit;
  isDone: boolean;
  isNext: boolean;
  isLocked: boolean;
  index: number;
}) {
  const offset = index % 2 === 0 ? "ml-0" : "ml-8";

  const baseCard = `relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${offset}`;

  if (isDone) {
    return (
      <Link
        href={getLessonHref(lesson)}
        className={`${baseCard} border-[var(--mint)] bg-white opacity-80 hover:opacity-100`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--mint)] text-2xl">
          {lesson.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-700 truncate text-sm text-[var(--text-primary)]">{lesson.title}</p>
          <p className="kana-text truncate text-xs text-[var(--text-secondary)]">
            {lesson.subtitle}
          </p>
        </div>
        <CheckCircle2 size={20} className="shrink-0 text-[var(--mint)]" />
      </Link>
    );
  }

  if (isNext) {
    return (
      <Link
        href={getLessonHref(lesson)}
        className={`${baseCard} animate-bounce-in border-[var(--coral-dark)] bg-[var(--coral)] shadow-[var(--coral)]/30 shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
          {lesson.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-800 truncate text-sm text-white">{lesson.title}</p>
          <p className="kana-text truncate text-xs text-white/80">{lesson.subtitle}</p>
          <span className="font-700 text-xs text-white/90">+{lesson.xp} XP</span>
        </div>
        <ChevronRight size={20} className="shrink-0 text-white" />
        {/* Pulsing ring to draw attention (Von Restorff) */}
        <span className="pointer-events-none absolute -inset-0.5 animate-ping rounded-2xl border-2 border-white/40" />
      </Link>
    );
  }

  return (
    <div className={`${baseCard} cursor-not-allowed border-[var(--border)] bg-white opacity-50`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
        <Lock size={18} className="text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-700 truncate text-sm text-[var(--text-secondary)]">{lesson.title}</p>
        <p className="truncate text-xs text-gray-400">{lesson.subtitle}</p>
      </div>
    </div>
  );
}
