"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createSession(
  classroomId: string,
  title: string,
  description?: string,
  scheduledAt?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
  if (!classroom || classroom.teacherId !== user.id) throw new Error("Forbidden");

  return prisma.session.create({
    data: {
      classroomId,
      title,
      description,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    },
  });
}

export async function updateSessionStatus(
  sessionId: string,
  status: "DRAFT" | "ACTIVE" | "COMPLETED"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { classroom: true },
  });
  if (!session || session.classroom.teacherId !== user.id) throw new Error("Forbidden");

  return prisma.session.update({ where: { id: sessionId }, data: { status } });
}

export async function getSessionDetail(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.session.findFirst({
    where: {
      id: sessionId,
      classroom: {
        OR: [{ teacherId: user.id }, { enrollments: { some: { studentId: user.id } } }],
      },
    },
    include: {
      classroom: { select: { name: true, teacherId: true } },
      assignments: {
        include: {
          _count: { select: { submissions: true } },
          submissions: {
            where: { studentId: user.id },
            select: { id: true, status: true, score: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { classroom: true },
  });
  if (!session || session.classroom.teacherId !== user.id) throw new Error("Forbidden");
  return prisma.session.delete({ where: { id: sessionId } });
}
