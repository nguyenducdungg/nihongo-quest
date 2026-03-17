"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AnswerRecord = {
  questionId: string;
  prompt: string;
  chosen: string;
  correct: boolean;
};

export async function submitAssignment(
  assignmentId: string,
  answers: AnswerRecord[],
  score: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { type: true },
  });

  // QUIZ and KANA_PRACTICE are auto-graded by the system — mark as GRADED immediately
  const autoGraded = assignment?.type === "QUIZ" || assignment?.type === "KANA_PRACTICE";
  const status = autoGraded ? "GRADED" : "SUBMITTED";
  const gradedAt = autoGraded ? new Date() : undefined;

  return prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
    update: {
      answers: answers as object[],
      score,
      status,
      submittedAt: new Date(),
      gradedAt: gradedAt ?? null,
    },
    create: {
      assignmentId,
      studentId: user.id,
      answers: answers as object[],
      score,
      status,
      gradedAt,
    },
  });
}

export async function gradeSubmission(submissionId: string, score: number, teacherNote?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { session: { include: { classroom: true } } } } },
  });
  if (!sub || sub.assignment.session.classroom.teacherId !== user.id) throw new Error("Forbidden");

  return prisma.submission.update({
    where: { id: submissionId },
    data: { score, teacherNote, status: "GRADED", gradedAt: new Date() },
  });
}
