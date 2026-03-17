"use client";

/**
 * Student Progress UI — Client Component for interactive session toggling.
 * Data is pre-fetched by the Server Component parent (page.tsx).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentProgressInClassroom } from "@/app/actions/classroom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Progress = NonNullable<Awaited<ReturnType<typeof getStudentProgressInClassroom>>>;
type Session = Progress["sessions"][number];
type Assignment = Session["assignments"][number];

const TYPE_EMOJI: Record<string, string> = {
  QUIZ: "📝",
  KANA_PRACTICE: "🔤",
  FLASHCARD: "🃏",
  FREE_WRITE: "✍️",
};

const STATUS_CONFIG = {
  DRAFT: { label: "Nháp", color: "bg-gray-100 text-gray-500" },
  ACTIVE: { label: "Đang mở", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-blue-100 text-blue-700" },
};

export default function StudentProgressView({
  data,
  classroomId,
}: {
  data: Progress;
  classroomId: string;
}) {
  const router = useRouter();
  const { classroom, student, sessions } = data;

  const initialExpanded = new Set(
    sessions.filter((s) => s.assignments.length > 0).map((s) => s.id)
  );
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(initialExpanded);

  const allAssignments = sessions.flatMap((s) => s.assignments);
  const submitted = allAssignments.filter((a) => a.submissions.length > 0);
  const graded = submitted.filter((a) => a.submissions[0]?.status === "GRADED");
  const totalScore = graded.reduce((sum, a) => sum + (a.submissions[0]?.score ?? 0), 0);
  const maxTotalScore = graded.reduce((sum, a) => sum + a.maxScore, 0);
  const completionPct =
    allAssignments.length > 0 ? Math.round((submitted.length / allAssignments.length) * 100) : 0;

  const toggleSession = (sid: string) =>
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      next.has(sid) ? next.delete(sid) : next.add(sid);
      return next;
    });

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4 pb-28">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/classroom/${classroomId}`)}
          className="font-600 mb-3 flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--coral)]"
        >
          <ArrowLeft size={16} /> {classroom.name}
        </button>

        {/* Student card */}
        <div className="space-y-4 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="font-900 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--coral-light)] text-2xl text-[var(--coral)]">
              {student.displayName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-900 truncate text-xl text-[var(--text-primary)]">
                {student.displayName}
              </h1>
              <div className="font-600 mt-1 flex gap-3 text-xs text-[var(--text-secondary)]">
                <span>⭐ {student.totalXP} XP</span>
                <span>🔥 {student.streak} ngày</span>
              </div>
            </div>
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox
              value={`${submitted.length}/${allAssignments.length}`}
              label="Đã nộp"
              color="text-[var(--coral)]"
            />
            <StatBox
              value={`${completionPct}%`}
              label="Hoàn thành"
              color={
                completionPct === 100
                  ? "text-[var(--mint-dark)]"
                  : completionPct >= 50
                    ? "text-orange-500"
                    : "text-red-500"
              }
            />
            <StatBox
              value={maxTotalScore > 0 ? `${Math.round(totalScore)}/${maxTotalScore}` : "—"}
              label="Tổng điểm"
              color="text-blue-600"
            />
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${completionPct}%`,
                  background:
                    completionPct === 100
                      ? "var(--mint-dark)"
                      : "linear-gradient(to right, var(--coral), var(--coral-dark))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        {sessions.length === 0 && (
          <p className="font-600 py-8 text-center text-sm text-[var(--text-secondary)]">
            Lớp học chưa có buổi học nào.
          </p>
        )}

        {sessions.map((session, idx) => {
          const cfg = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG];
          const isExpanded = expandedSessions.has(session.id);
          const sessionSubmitted = session.assignments.filter(
            (a) => a.submissions.length > 0
          ).length;
          const sessionTotal = session.assignments.length;

          return (
            <div
              key={session.id}
              className="overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-white"
            >
              <button
                onClick={() => toggleSession(session.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--cream)]"
              >
                <span className="font-900 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[var(--cream)] text-xs text-[var(--text-secondary)]">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-800 truncate text-sm text-[var(--text-primary)]">
                    {session.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className={`font-700 rounded-full px-1.5 py-0.5 text-[10px] ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {session.scheduledAt && (
                      <span className="font-600 text-[10px] text-[var(--text-secondary)]">
                        {new Date(session.scheduledAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {sessionTotal > 0 && (
                    <p
                      className={`font-800 text-xs ${sessionSubmitted === sessionTotal ? "text-[var(--mint-dark)]" : "text-[var(--coral)]"}`}
                    >
                      {sessionSubmitted}/{sessionTotal}
                    </p>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={14} className="mt-0.5 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronDown size={14} className="mt-0.5 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-[var(--border)] border-t-2 border-[var(--border)]">
                  {session.assignments.length === 0 ? (
                    <p className="font-600 px-4 py-3 text-xs text-[var(--text-secondary)]">
                      Buổi học chưa có bài tập.
                    </p>
                  ) : (
                    session.assignments.map((a) => <AssignmentRow key={a.id} assignment={a} />)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const sub = assignment.submissions[0];
  const done = !!sub;
  const isAutoGraded = assignment.type === "QUIZ" || assignment.type === "KANA_PRACTICE";
  const emoji = TYPE_EMOJI[assignment.type] ?? "📄";

  return (
    <div className="space-y-1.5 px-4 py-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            !done ? "bg-gray-100" : sub.status === "GRADED" ? "bg-green-100" : "bg-orange-100"
          }`}
        >
          {!done ? (
            <XCircle size={13} className="text-gray-400" />
          ) : sub.status === "GRADED" ? (
            <CheckCircle2 size={13} className="text-green-600" />
          ) : (
            <Clock size={13} className="text-orange-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-700 truncate text-sm text-[var(--text-primary)]">
            {emoji} {assignment.title}
          </p>
        </div>

        <div className="shrink-0 text-right">
          {!done ? (
            <span className="font-700 text-xs text-gray-400">Chưa nộp</span>
          ) : sub.status === "GRADED" ? (
            <span className="font-900 text-sm text-[var(--coral)]">
              {sub.score ?? 0}
              <span className="font-600 text-[10px] text-[var(--text-secondary)]">
                /{assignment.maxScore}
              </span>
            </span>
          ) : (
            <span className="font-700 flex items-center gap-1 text-xs text-orange-500">
              <Clock size={11} /> Chờ chấm
            </span>
          )}
        </div>
      </div>

      {done && (
        <div className="space-y-1 pl-8">
          <p className="font-600 text-[10px] text-[var(--text-secondary)]">
            Nộp lúc {new Date(sub.submittedAt).toLocaleString("vi-VN")}
            {isAutoGraded && (
              <span className="font-700 ml-2 text-[var(--mint-dark)]">· Tự chấm</span>
            )}
          </p>
          {sub.teacherNote && (
            <div className="font-600 flex items-start gap-1 text-[10px] text-blue-600">
              <MessageSquare size={10} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{sub.teacherNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl bg-[var(--cream)] p-3 text-center">
      <p className={`font-900 text-xl ${color}`}>{value}</p>
      <p className="font-600 mt-0.5 text-[10px] text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
