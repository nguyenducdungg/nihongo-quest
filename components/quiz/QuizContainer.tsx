"use client";

/**
 * QuizContainer — Manages quiz state: playing vs completed, score tracking
 */

import { useState } from "react";
import { QuizQuestion, LessonUnit } from "@/types";
import { completeLesson } from "@/app/actions/progress";
import QuizPresenter from "./QuizPresenter";
import QuizResultPresenter from "./QuizResultPresenter";

interface Props {
  questions: QuizQuestion[];
  lesson: LessonUnit;
  initialCompleted: boolean;
  hideXP?: boolean; // When true, skip XP/progress tracking (used in builder mode)
}

export default function QuizContainer({
  questions,
  lesson,
  initialCompleted,
  hideXP = false,
}: Props) {
  const [phase, setPhase] = useState<"playing" | "done">(initialCompleted ? "done" : "playing");
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(initialCompleted ? lesson.xp : 0);

  const handleComplete = (score: number) => {
    setFinalScore(score);
    const earned = hideXP ? 0 : Math.round((score / questions.length) * lesson.xp);
    setXpEarned(earned);
    if (!initialCompleted && !hideXP) completeLesson(lesson.id, earned);
    setPhase("done");
  };

  const handleRetry = () => {
    setPhase("playing");
    setFinalScore(0);
  };

  if (phase === "done") {
    return (
      <QuizResultPresenter
        score={finalScore}
        total={questions.length}
        xpEarned={xpEarned}
        onRetry={handleRetry}
      />
    );
  }

  return <QuizPresenter questions={questions} onComplete={handleComplete} />;
}
