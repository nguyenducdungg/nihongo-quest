"use client";

/**
 * VocabContainer — Manages completion state for vocabulary lessons
 */

import { useState } from "react";
import { VocabItem, LessonUnit } from "@/types";
import { completeLesson } from "@/app/actions/progress";
import VocabPresenter from "./VocabPresenter";
import CelebrationOverlay from "@/components/character/CelebrationOverlay";

interface Props {
  items: VocabItem[];
  topicLabel: string;
  topicEmoji: string;
  lesson: LessonUnit;
  initialCompleted: boolean;
}

export default function VocabContainer({
  items,
  topicLabel,
  topicEmoji,
  lesson,
  initialCompleted,
}: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    completeLesson(lesson.id, lesson.xp);
    setCompleted(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  return (
    <>
      {showCelebration && <CelebrationOverlay xp={lesson.xp} />}
      <VocabPresenter
        items={items}
        topicLabel={topicLabel}
        topicEmoji={topicEmoji}
        onComplete={handleComplete}
        isCompleted={completed}
      />
    </>
  );
}
