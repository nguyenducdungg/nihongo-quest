"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Teacher dashboard stats */
export async function getTeacherStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: user.id },
    include: {
      _count: { select: { enrollments: true, sessions: true } },
      sessions: {
        include: {
          _count: { select: { assignments: true } },
          assignments: {
            include: { _count: { select: { submissions: true } } },
          },
        },
      },
      enrollments: { select: { studentId: true } },
    },
  });

  const totalClassrooms = classrooms.length;
  const totalStudents = new Set(classrooms.flatMap((c) => c.enrollments.map((e) => e.studentId)))
    .size;
  const totalSessions = classrooms.reduce((s, c) => s + c._count.sessions, 0);
  const totalAssignments = classrooms.reduce(
    (s, c) => s + c.sessions.reduce((ss, session) => ss + session._count.assignments, 0),
    0
  );

  // Count submissions that are SUBMITTED (not yet graded)
  const pendingGrades = await prisma.submission.count({
    where: {
      status: "SUBMITTED",
      assignment: { session: { classroom: { teacherId: user.id } } },
    },
  });

  // Active sessions right now
  const activeSessions = await prisma.session.count({
    where: { status: "ACTIVE", classroom: { teacherId: user.id } },
  });

  // Recent classrooms with last session info
  const recentClassrooms = classrooms.slice(0, 4).map((c) => ({
    id: c.id,
    name: c.name,
    inviteCode: c.inviteCode,
    studentCount: c.enrollments.length,
    sessionCount: c._count.sessions,
    activeSessions: c.sessions.filter((s) => s.status === "ACTIVE").length,
  }));

  return {
    totalClassrooms,
    totalStudents,
    totalSessions,
    totalAssignments,
    pendingGrades,
    activeSessions,
    recentClassrooms,
  };
}

/** Student: get progress summary for all enrolled classrooms */
export async function getStudentClassroomProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      classroom: {
        include: {
          teacher: { select: { displayName: true } },
          sessions: {
            orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
            include: {
              assignments: {
                include: {
                  submissions: {
                    where: { studentId: user.id },
                    select: { score: true, status: true },
                  },
                  _count: { select: { submissions: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return enrollments.map((e) => {
    const sessions = e.classroom.sessions;
    const completedSessions = sessions.filter(
      (s) =>
        s.status === "COMPLETED" ||
        (s.assignments.length > 0 && s.assignments.every((a) => a.submissions.length > 0))
    ).length;

    return {
      classroomId: e.classroomId,
      classroomName: e.classroom.name,
      teacherName: e.classroom.teacher.displayName,
      totalSessions: sessions.length,
      completedSessions,
      activeSessions: sessions.filter((s) => s.status === "ACTIVE").length,
    };
  });
}
