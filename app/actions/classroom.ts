"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "@/lib/utils";

// ===== Teacher: Classroom Management =====

export async function getMyClassrooms() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.classroom.findMany({
    where: { teacherId: user.id },
    include: { _count: { select: { enrollments: true, sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClassroom(name: string, description?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  return prisma.classroom.create({
    data: {
      name,
      description,
      teacherId: user.id,
      inviteCode: nanoid(8),
    },
  });
}

export async function deleteClassroom(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const c = await prisma.classroom.findUnique({ where: { id } });
  if (!c || c.teacherId !== user.id) throw new Error("Forbidden");
  return prisma.classroom.delete({ where: { id } });
}

export async function getClassroomDetail(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.classroom.findFirst({
    where: {
      id,
      OR: [{ teacherId: user.id }, { enrollments: { some: { studentId: user.id } } }],
    },
    include: {
      teacher: { select: { displayName: true } },
      enrollments: {
        include: {
          student: { select: { id: true, displayName: true, totalXP: true, streak: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      sessions: {
        include: {
          _count: { select: { assignments: true } },
          assignments: {
            include: {
              submissions: { where: {}, select: { studentId: true, status: true, score: true } },
            },
          },
        },
        // Sort: scheduledAt ASC (null last), then createdAt ASC — chronological order for curriculum
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function updateMeetLink(classroomId: string, meetLink: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const c = await prisma.classroom.findUnique({ where: { id: classroomId } });
  if (!c || c.teacherId !== user.id) throw new Error("Forbidden");

  const url = meetLink.trim();
  // Allow clearing the link by passing empty string
  return prisma.classroom.update({
    where: { id: classroomId },
    data: { meetLink: url || null },
  });
}

/** Teacher: view a specific student's progress inside a classroom */
export async function getStudentProgressInClassroom(classroomId: string, studentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Only the classroom teacher can access this
  const classroom = await prisma.classroom.findFirst({
    where: { id: classroomId, teacherId: user.id },
    select: { id: true, name: true },
  });
  if (!classroom) return null;

  // Fetch student profile and sessions in parallel
  const [student, sessions] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: studentId },
      select: { id: true, displayName: true, totalXP: true, streak: true },
    }),
    prisma.session.findMany({
      where: { classroomId },
      include: {
        assignments: {
          include: {
            submissions: {
              where: { studentId },
              select: { id: true, score: true, status: true, submittedAt: true, teacherNote: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!student) return null;

  return { classroom, student, sessions };
}

// ===== Student: Join / Leave Classroom =====

export async function joinClassroom(inviteCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const classroom = await prisma.classroom.findUnique({ where: { inviteCode } });
  if (!classroom) throw new Error("Mã lớp không hợp lệ.");
  if (!classroom.isActive) throw new Error("Lớp học đã đóng.");

  return prisma.enrollment.upsert({
    where: { studentId_classroomId: { studentId: user.id, classroomId: classroom.id } },
    update: {},
    create: { studentId: user.id, classroomId: classroom.id },
  });
}

export async function getJoinedClassrooms() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  return prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      classroom: {
        include: {
          teacher: { select: { displayName: true } },
          _count: { select: { sessions: true, enrollments: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}
