"use client";

/**
 * CharacterFetcher — Resolves which characters to show based on URL params
 * Loads progress from localStorage to determine if lesson is already complete
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hiraganaData, hiraganaGroups } from "@/data/hiragana";
import { katakanaData } from "@/data/katakana";
import { roadmapLessons } from "@/data/roadmap";
// getProgress imported dynamically inside useEffect
import { Character, LessonUnit } from "@/types";
import CharacterContainer from "./CharacterContainer";

interface Props {
  writingSystem: "hiragana" | "katakana";
}

export default function CharacterFetcher({ writingSystem }: Props) {
  const searchParams = useSearchParams();
  const groupKey = searchParams.get("group") ?? "vowels";
  const lessonId = searchParams.get("lesson") ?? "";

  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const sourceData = writingSystem === "hiragana" ? hiraganaData : katakanaData;
  const chars: Character[] = sourceData.filter((c) => c.group === groupKey);
  const groupLabel =
    hiraganaGroups.find((g) => g.key === groupKey)?.label ??
    `${writingSystem === "hiragana" ? "Hiragana" : "Katakana"}: ${groupKey.toUpperCase()}`;

  // Find matching lesson for this group
  const lesson: LessonUnit = roadmapLessons.find(
    (l) => l.type === writingSystem && l.topicKey === groupKey
  ) ?? {
    id: lessonId || `${writingSystem}-${groupKey}`,
    title: groupLabel,
    subtitle: "",
    type: writingSystem,
    level: 1,
    xp: 20,
    icon: "🌸",
    topicKey: groupKey,
  };

  useEffect(() => {
    import("@/app/actions/progress").then(({ getProgress }) => {
      getProgress().then((p) => {
        setIsCompleted(p?.completedLessons.includes(lesson.id) ?? false);
        setMounted(true);
      });
    });
  }, [lesson.id]);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-48 rounded-xl bg-[var(--border)]" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border-2 border-[var(--border)] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (chars.length === 0) {
    return (
      <p className="font-600 py-12 text-center text-[var(--text-secondary)]">
        Không tìm thấy ký tự cho nhóm này.
      </p>
    );
  }

  return (
    <CharacterContainer
      characters={chars}
      groupLabel={groupLabel}
      lesson={lesson}
      initialCompleted={isCompleted}
    />
  );
}
