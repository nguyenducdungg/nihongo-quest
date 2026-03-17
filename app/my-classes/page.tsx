"use client";

/**
 * Student — My Classes page
 * Shows joined classrooms and pending assignments with due dates
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getJoinedClassrooms, joinClassroom } from "@/app/actions/classroom";
import { getMyAssignments } from "@/app/actions/assignment";
import {
  School,
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Users,
} from "lucide-react";

type JoinedClassroom = Awaited<ReturnType<typeof getJoinedClassrooms>>[number];
type Assignment = Awaited<ReturnType<typeof getMyAssignments>>[number];

export default function MyClassesPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<JoinedClassroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [tab, setTab] = useState<"assignments" | "classrooms">("assignments");

  const refresh = useCallback(async () => {
    const [cls, asgns] = await Promise.all([getJoinedClassrooms(), getMyAssignments()]);
    setClassrooms(cls);
    setAssignments(asgns);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setJoining(true);
    setJoinError("");
    try {
      await joinClassroom(code.trim().toUpperCase());
      setCode("");
      setShowJoin(false);
      refresh();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setJoining(false);
    }
  };

  const pendingCount = assignments.filter((a) => a.submissions.length === 0).length;
  const doneCount = assignments.filter((a) => a.submissions.length > 0).length;

  // Group assignments by session, sessions sorted newest first
  type SessionGroup = {
    sessionId: string;
    sessionTitle: string;
    classroomName: string;
    sortDate: Date;
    assignments: typeof assignments;
  };
  const sessionGroups: SessionGroup[] = Object.values(
    assignments.reduce<Record<string, SessionGroup>>((acc, a) => {
      const sid = a.session.id;
      if (!acc[sid]) {
        const date = a.session.scheduledAt ?? a.session.createdAt;
        acc[sid] = {
          sessionId: sid,
          sessionTitle: a.session.title,
          classroomName: a.session.classroom.name,
          sortDate: new Date(date),
          assignments: [],
        };
      }
      acc[sid].assignments.push(a);
      return acc;
    }, {})
  ).sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-900 text-2xl text-[var(--text-primary)]">Lớp học của tôi 📚</h1>
          <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
            {pendingCount > 0 ? (
              <span className="text-[var(--coral)]">{pendingCount} bài chưa nộp</span>
            ) : (
              "Không có bài tập đang chờ"
            )}
          </p>
        </div>
        <button
          onClick={() => setShowJoin((s) => !s)}
          className="font-700 flex items-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] px-4 py-2 text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} /> Vào lớp
        </button>
      </div>

      {/* Join classroom form */}
      {showJoin && (
        <form
          onSubmit={handleJoin}
          className="animate-slide-up space-y-3 rounded-3xl border-2 border-[var(--coral)]/40 bg-white p-4"
        >
          <p className="font-800 text-[var(--text-primary)]">Nhập mã mời</p>
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VD: NQ2A3B4C"
            maxLength={8}
            className="font-900 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-center text-lg tracking-[0.3em] uppercase transition-colors focus:border-[var(--coral)] focus:outline-none"
          />
          {joinError && (
            <p className="font-600 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500">
              {joinError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={joining || code.length < 8}
              className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3 text-sm text-white disabled:opacity-50"
            >
              {joining ? <Loader2 size={16} className="animate-spin" /> : "Vào lớp"}
            </button>
            <button
              type="button"
              onClick={() => setShowJoin(false)}
              className="font-700 rounded-2xl border-2 border-[var(--border)] px-5 py-3 text-sm text-[var(--text-secondary)]"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-[var(--cream)] p-1">
        {(["assignments", "classrooms"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-700 flex-1 rounded-xl py-2 text-sm transition-all ${tab === t ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"}`}
          >
            {t === "assignments"
              ? `📝 Bài tập ${pendingCount > 0 ? `(${pendingCount})` : ""}`
              : `🏫 Lớp (${classrooms.length})`}
          </button>
        ))}
      </div>

      {/* Assignments tab — grouped by session, newest first */}
      {tab === "assignments" && (
        <>
          {assignments.length === 0 ? (
            <div className="space-y-2 rounded-3xl border-2 border-[var(--border)] bg-white p-10 text-center">
              <p className="text-3xl">🎉</p>
              <p className="font-800 text-[var(--text-primary)]">Không có bài tập nào!</p>
              <p className="font-600 text-sm text-[var(--text-secondary)]">
                Giáo viên chưa giao bài hoặc bạn chưa vào lớp.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {sessionGroups.map((group) => {
                const groupPending = group.assignments.filter(
                  (a) => a.submissions.length === 0
                ).length;
                const groupDone = group.assignments.filter((a) => a.submissions.length > 0).length;
                return (
                  <div key={group.sessionId}>
                    {/* Session header */}
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-800 text-xs text-[var(--text-primary)]">
                          {group.sessionTitle}
                        </p>
                        <p className="font-600 text-[10px] text-[var(--text-secondary)]">
                          {group.classroomName}
                          {group.sortDate && ` · ${group.sortDate.toLocaleDateString("vi-VN")}`}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {groupPending > 0 && (
                          <span className="font-800 rounded-full bg-[var(--coral-light)] px-2 py-0.5 text-[10px] text-[var(--coral)]">
                            {groupPending} chưa nộp
                          </span>
                        )}
                        {groupDone > 0 && (
                          <span className="font-800 rounded-full bg-[var(--mint)]/20 px-2 py-0.5 text-[10px] text-[var(--mint-dark)]">
                            {groupDone} đã nộp
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assignment cards in this session */}
                    <div className="space-y-2 border-l-2 border-[var(--border)] pl-3">
                      {group.assignments.map((a) => (
                        <AssignmentCard
                          key={a.id}
                          assignment={a}
                          done={a.submissions.length > 0}
                          onClick={() => router.push(`/assignment/${a.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Classrooms tab */}
      {tab === "classrooms" && (
        <>
          {classrooms.length === 0 ? (
            <div className="space-y-2 rounded-3xl border-2 border-[var(--border)] bg-white p-10 text-center">
              <div className="flex justify-center text-[var(--text-secondary)]/30">
                <School size={40} />
              </div>
              <p className="font-800 text-[var(--text-primary)]">Chưa tham gia lớp nào</p>
              <p className="font-600 text-sm text-[var(--text-secondary)]">
                Nhập mã mời từ giáo viên để vào lớp.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classrooms.map((e) => (
                <div
                  key={e.id}
                  onClick={() => router.push(`/classroom/${e.classroomId}`)}
                  className="cursor-pointer rounded-3xl border-2 border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--coral)]/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-900 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--coral-light)] text-xl text-[var(--coral)]">
                      {e.classroom.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-800 truncate text-[var(--text-primary)]">
                        {e.classroom.name}
                      </p>
                      <p className="font-600 text-xs text-[var(--text-secondary)]">
                        GV: {e.classroom.teacher.displayName}
                      </p>
                      <div className="font-600 mt-1 flex gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {e.classroom._count.enrollments}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} /> {e.classroom._count.sessions} buổi
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-[var(--text-secondary)]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment,
  done,
  onClick,
}: {
  assignment: Assignment;
  done: boolean;
  onClick: () => void;
}) {
  const sub = assignment.submissions[0];
  const isOverdue = !done && assignment.dueAt && new Date(assignment.dueAt) < new Date();

  return (
    <div
      onClick={onClick}
      className={`mb-2 cursor-pointer rounded-3xl border-2 bg-white p-4 transition-all hover:shadow-md ${
        done
          ? "border-[var(--mint)]/30"
          : isOverdue
            ? "border-red-200"
            : "border-[var(--border)] hover:border-[var(--coral)]/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
            done ? "bg-[var(--mint)]/20" : isOverdue ? "bg-red-50" : "bg-[var(--coral-light)]"
          }`}
        >
          {done ? "✅" : isOverdue ? "⚠️" : "📝"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-800 truncate text-sm text-[var(--text-primary)]">{assignment.title}</p>
          <div className="font-600 mt-1 flex items-center gap-3 text-xs">
            {done && sub ? (
              <span className="flex items-center gap-1 text-[var(--mint-dark)]">
                <CheckCircle2 size={11} />
                {sub.status === "GRADED" ? `${sub.score} điểm` : "Đã nộp — chờ chấm"}
              </span>
            ) : (
              <>
                {assignment.dueAt && (
                  <span
                    className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-[var(--text-secondary)]"}`}
                  >
                    <Clock size={11} />
                    {isOverdue ? "Quá hạn · " : "Hạn: "}
                    {new Date(assignment.dueAt).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="mt-1 shrink-0 text-[var(--text-secondary)]" />
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-3 px-4 pt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-3xl border-2 border-[var(--border)] bg-white" />
      ))}
    </div>
  );
}
