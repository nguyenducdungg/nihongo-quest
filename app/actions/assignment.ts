"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AssignmentTypeValue = "QUIZ" | "FLASHCARD" | "KANA_PRACTICE" | "FREE_WRITE";

export async function createAssignment(data: {
  sessionId: string;
  type: AssignmentTypeValue;
  title: string;
  description?: string;
  contentRef: object;
  dueAt?: string;
  maxScore?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const session = await prisma.session.findUnique({
    where: { id: data.sessionId },
    include: { classroom: true },
  });
  if (!session || session.classroom.teacherId !== user.id) throw new Error("Forbidden");

  return prisma.assignment.create({
    data: {
      sessionId: data.sessionId,
      type: data.type,
      title: data.title,
      description: data.description,
      contentRef: data.contentRef,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      maxScore: data.maxScore ?? 100,
    },
  });
}

export async function updateAssignment(
  id: string,
  data: {
    title?: string;
    description?: string;
    dueAt?: string | null;
    maxScore?: number;
    contentRef?: object;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const a = await prisma.assignment.findUnique({
    where: { id },
    include: { session: { include: { classroom: true } } },
  });
  if (!a || a.session.classroom.teacherId !== user.id) throw new Error("Forbidden");

  return prisma.assignment.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.dueAt !== undefined && { dueAt: data.dueAt ? new Date(data.dueAt) : null }),
      ...(data.maxScore !== undefined && { maxScore: data.maxScore }),
      ...(data.contentRef !== undefined && { contentRef: data.contentRef }),
    },
  });
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const a = await prisma.assignment.findUnique({
    where: { id },
    include: { session: { include: { classroom: true } } },
  });
  if (!a || a.session.classroom.teacherId !== user.id) throw new Error("Forbidden");
  return prisma.assignment.delete({ where: { id } });
}

/** Get all assignments for a student across all their enrolled classrooms */
export async function getMyAssignments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    select: { classroomId: true },
  });
  const classroomIds = enrollments.map((e) => e.classroomId);

  return prisma.assignment.findMany({
    where: {
      session: {
        classroomId: { in: classroomIds },
        status: "ACTIVE",
      },
    },
    include: {
      session: {
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          createdAt: true,
          classroom: { select: { name: true } },
        },
      },
      submissions: {
        where: { studentId: user.id },
        select: { score: true, status: true, submittedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAssignmentForStudent(assignmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      session: {
        status: "ACTIVE",
        classroom: { enrollments: { some: { studentId: user.id } } },
      },
    },
    include: {
      session: { include: { classroom: { select: { name: true } } } },
      submissions: {
        where: { studentId: user.id },
        select: {
          id: true,
          score: true,
          status: true,
          submittedAt: true,
          answers: true,
          teacherNote: true,
          gradedAt: true,
        },
      },
    },
  });
}

/** Get all submissions for an assignment (teacher view) */
export async function getSubmissionsForAssignment(assignmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const a = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      session: { classroom: { teacherId: user.id } },
    },
  });
  if (!a) return [];

  return prisma.submission.findMany({
    where: { assignmentId },
    include: { student: { select: { id: true, displayName: true, totalXP: true } } },
    orderBy: { submittedAt: "desc" },
  });
}
