"use client";

/**
 * useProgress — Client hook that fetches progress from DB via Server Action
 * Replaces all direct localStorage reads throughout the app
 */

import { useState, useEffect, useCallback } from "react";
import { getProgress, completeLesson as completeLessonAction } from "@/app/actions/progress";
import { getLevelFromXP, getXPToNextLevel } from "@/lib/progress";

interface ProgressState {
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
}

const DEFAULT: ProgressState = {
  totalXP: 0,
  streak: 1,
  lastActiveDate: "",
  completedLessons: [],
};

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getProgress();
      if (data) setProgress(data);
    } catch {
      // Fallback: user not authenticated or DB unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeLesson = useCallback(async (lessonId: string, xp: number) => {
    try {
      const updated = await completeLessonAction(lessonId, xp);
      if (updated) setProgress(updated);
      return updated;
    } catch {
      return null;
    }
  }, []);

  const level = getLevelFromXP(progress.totalXP);
  const xpProgress = getXPToNextLevel(progress.totalXP);

  return { progress, loading, completeLesson, refresh, level, xpProgress };
}
