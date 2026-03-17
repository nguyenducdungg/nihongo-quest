import { UserProgress } from "@/types";

const STORAGE_KEY = "nihongo_quest_progress";

const defaultProgress: UserProgress = {
  completedLessons: [],
  totalXP: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
};

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return JSON.parse(raw) as UserProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeLesson(lessonId: string, xp: number): UserProgress {
  const progress = getProgress();
  if (progress.completedLessons.includes(lessonId)) return progress;

  const today = new Date().toISOString().split("T")[0];
  const lastDate = progress.lastActiveDate;
  const diffDays = Math.round(
    (new Date(today).getTime() - new Date(lastDate).getTime()) / (24 * 60 * 60 * 1000)
  );

  // Only update streak when today is a new day
  // diffDays === 0 → same day, streak unchanged
  // diffDays === 1 → consecutive day, streak + 1
  // diffDays > 1   → streak broken, reset to 1
  const newStreak = diffDays === 0 ? progress.streak : diffDays === 1 ? progress.streak + 1 : 1;

  const updated: UserProgress = {
    completedLessons: [...progress.completedLessons, lessonId],
    totalXP: progress.totalXP + xp,
    streak: newStreak,
    lastActiveDate: today,
  };

  saveProgress(updated);
  return updated;
}

export function getLevelFromXP(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  return 4;
}

export function getXPToNextLevel(xp: number): { current: number; needed: number } {
  if (xp < 100) return { current: xp, needed: 100 };
  if (xp < 300) return { current: xp - 100, needed: 200 };
  if (xp < 600) return { current: xp - 300, needed: 300 };
  return { current: xp - 600, needed: 400 };
}
