"use client";

/**
 * CharacterContainer — Manages lesson completion state for kana learning
 * Writes XP to localStorage when lesson is marked complete
 */

import { useState } from "react";
import { Character, LessonUnit } from "@/types";
import { completeLesson } from "@/app/actions/progress";
import CharacterPresenter from "./CharacterPresenter";
import CelebrationOverlay from "./CelebrationOverlay";

interface Props {
  characters: Character[];
  groupLabel: string;
  lesson: LessonUnit;
  initialCompleted: boolean;
}

export default function CharacterContainer({
  characters,
  groupLabel,
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
      <CharacterPresenter
        characters={characters}
        groupLabel={groupLabel}
        onComplete={handleComplete}
        isCompleted={completed}
      />
    </>
  );
}
