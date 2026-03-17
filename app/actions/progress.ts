"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Get current user's learning progress */
export async function getProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      totalXP: true,
      streak: true,
      lastActiveDate: true,
      completedLessons: true,
    },
  });

  return profile;
}

/** Mark a lesson as complete and award XP */
export async function completeLesson(lessonId: string, xp: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) throw new Error("Profile not found");

  // Skip if already completed
  if (profile.completedLessons.includes(lessonId)) return profile;

  const today = new Date().toISOString().split("T")[0];
  const lastDate = profile.lastActiveDate;
  const diffDays = Math.round(
    (new Date(today).getTime() - new Date(lastDate || today).getTime()) / (24 * 60 * 60 * 1000)
  );

  const newStreak = diffDays === 0 ? profile.streak : diffDays === 1 ? profile.streak + 1 : 1;

  return prisma.profile.update({
    where: { id: user.id },
    data: {
      completedLessons: { push: lessonId },
      totalXP: { increment: xp },
      streak: newStreak,
      lastActiveDate: today,
    },
  });
}
