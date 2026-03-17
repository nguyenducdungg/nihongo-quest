"use client";

/**
 * VocabFetcher — Resolves vocab items and lesson data from URL params
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { vocabularyData, vocabTopics } from "@/data/vocabulary";
import { roadmapLessons } from "@/data/roadmap";
// getProgress imported dynamically inside useEffect
import { LessonUnit } from "@/types";
import VocabContainer from "./VocabContainer";

export default function VocabFetcher() {
  const searchParams = useSearchParams();
  const topicKey = searchParams.get("topic") ?? "greetings";

  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const topic = vocabTopics.find((t) => t.key === topicKey);
  const items = vocabularyData.filter((v) => v.topic === topicKey);

  const lesson: LessonUnit = roadmapLessons.find(
    (l) => l.type === "vocabulary" && l.topicKey === topicKey
  ) ?? {
    id: `vocab-${topicKey}`,
    title: topic?.label ?? topicKey,
    subtitle: "",
    type: "vocabulary",
    level: topic?.level ?? 1,
    xp: 25,
    icon: topic?.emoji ?? "📖",
    topicKey,
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
      <div className="animate-pulse space-y-4">
        <div className="h-4 rounded-full bg-[var(--border)]" />
        <div className="h-48 rounded-3xl border-2 border-[var(--border)] bg-white" />
      </div>
    );
  }

  return (
    <VocabContainer
      items={items}
      topicLabel={topic?.label ?? topicKey}
      topicEmoji={topic?.emoji ?? "📖"}
      lesson={lesson}
      initialCompleted={isCompleted}
    />
  );
}
