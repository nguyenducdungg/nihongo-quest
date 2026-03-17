"use client";

/**
 * QuizFetcher — Generates quiz questions from hiragana + vocabulary data
 * Shuffles choices and builds QuizQuestion objects ready for QuizContainer
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hiraganaData } from "@/data/hiragana";
import { vocabularyData } from "@/data/vocabulary";
import { roadmapLessons } from "@/data/roadmap";
// getProgress imported dynamically inside useEffect to avoid circular dependencies
import { QuizQuestion, LessonUnit } from "@/types";
import QuizContainer from "./QuizContainer";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildKanaQuestions(count = 8): QuizQuestion[] {
  const pool = shuffle(hiraganaData).slice(0, count);
  return pool.map((char) => {
    const distractors = shuffle(
      hiraganaData.filter((c) => c.romaji !== char.romaji).map((c) => c.romaji)
    ).slice(0, 3);
    return {
      id: `kana-${char.kana}`,
      type: "kana-to-romaji",
      prompt: char.kana,
      answer: char.romaji,
      choices: shuffle([char.romaji, ...distractors]),
    };
  });
}

function buildVocabQuestions(count = 8): QuizQuestion[] {
  const pool = shuffle(vocabularyData).slice(0, count);
  return pool.map((item) => {
    const distractors = shuffle(
      vocabularyData.filter((v) => v.meaning !== item.meaning).map((v) => v.meaning)
    ).slice(0, 3);
    return {
      id: `vocab-${item.japanese}`,
      type: "vocab-meaning",
      prompt: item.japanese,
      answer: item.meaning,
      choices: shuffle([item.meaning, ...distractors]),
    };
  });
}

export default function QuizFetcher() {
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get("lesson") ?? "";

  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const lesson: LessonUnit = roadmapLessons.find((l) => l.id === lessonParam) ?? {
    id: "free-quiz",
    title: "Quiz tự do",
    subtitle: "",
    type: "quiz",
    level: 1,
    xp: 30,
    icon: "⚡",
  };

  useEffect(() => {
    const isVocabLesson = lessonParam.includes("vocab") || lessonParam.includes("level-2");
    const qs = isVocabLesson
      ? [...buildKanaQuestions(5), ...buildVocabQuestions(5)]
      : [...buildKanaQuestions(8), ...buildVocabQuestions(2)];

    setQuestions(shuffle(qs));
    import("@/app/actions/progress").then(({ getProgress }) => {
      getProgress().then((p) => {
        setIsCompleted(p?.completedLessons.includes(lesson.id) ?? false);
        setMounted(true);
      });
    });
  }, [lesson.id, lessonParam]);

  if (!mounted || questions.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 rounded-full bg-[var(--border)]" />
        <div className="h-40 rounded-3xl border-2 border-[var(--border)] bg-white" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl border-2 border-[var(--border)] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return <QuizContainer questions={questions} lesson={lesson} initialCompleted={isCompleted} />;
}
