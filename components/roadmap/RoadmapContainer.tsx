"use client";

/**
 * RoadmapContainer — Manages progress state for the roadmap
 * Reads from localStorage and passes derived data to Presenter
 */

import { useState, useCallback } from "react";
import { LessonUnit, UserProgress } from "@/types";
import RoadmapPresenter from "./RoadmapPresenter";

interface Props {
  lessons: LessonUnit[];
  initialProgress: UserProgress;
}

export default function RoadmapContainer({ lessons, initialProgress }: Props) {
  const [progress] = useState<UserProgress>(initialProgress);
  const completedIds = useCallback(
    () => new Set(progress.completedLessons),
    [progress.completedLessons]
  );

  return (
    <RoadmapPresenter lessons={lessons} completedIds={completedIds()} totalXP={progress.totalXP} />
  );
}
