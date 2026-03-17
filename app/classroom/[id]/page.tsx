"use client";

/**
 * Classroom Detail
 * Teacher view: manage sessions (create/delete/open/close), enrolled students
 * Student view: curriculum timeline showing all sessions + personal progress
 */

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getClassroomDetail, updateMeetLink } from "@/app/actions/classroom";
import { createSession, deleteSession } from "@/app/actions/session";
import { getProfile } from "@/app/actions/auth";
import {
  ArrowLeft,
  Plus,
  Users,
  BookOpen,
  Calendar,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Lock,
  Trash2,
  Video,
  ExternalLink,
  Pencil,
  Check,
  X,
} from "lucide-react";

type Detail = Awaited<ReturnType<typeof getClassroomDetail>>;
type Session = NonNullable<Detail>["sessions"][number];

const STATUS_CONFIG = {
  DRAFT: {
    label: "Sắp diễn ra",
    color: "bg-gray-100 text-gray-500",
    icon: <Lock size={11} />,
    dot: "bg-gray-300",
  },
  ACTIVE: {
    label: "Đang mở",
    color: "bg-green-100 text-green-600",
    icon: <Play size={11} />,
    dot: "bg-green-500",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle2 size={11} />,
    dot: "bg-blue-400",
  },
};

export default function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState<Detail>(null);
  const [myId, setMyId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<"sessions" | "students">("sessions");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [editingMeetLink, setEditingMeetLink] = useState(false);
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [savingMeetLink, setSavingMeetLink] = useState(false);

  const refresh = useCallback(() => {
    getClassroomDetail(id).then(setDetail);
  }, [id]);

  useEffect(() => {
    refresh();
    getProfile().then((p) => setMyId(p?.id ?? ""));
  }, [refresh]);

  const isTeacher = detail?.teacherId === myId;

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    await createSession(id, title.trim(), desc.trim() || undefined, scheduledAt || undefined);
    setTitle("");
    setDesc("");
    setScheduledAt("");
    setShowForm(false);
    refresh();
    setCreating(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    setDeleteTarget(null);
    refresh();
  };

  const handleSaveMeetLink = async () => {
    setSavingMeetLink(true);
    await updateMeetLink(id, meetLinkInput);
    setSavingMeetLink(false);
    setEditingMeetLink(false);
    refresh();
  };

  const startEditMeetLink = () => {
    setMeetLinkInput(detail?.meetLink ?? "");
    setEditingMeetLink(true);
  };

  if (!detail) return <PageLoader />;

  const sessions = detail.sessions;
  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const activeCount = sessions.filter((s) => s.status === "ACTIVE").length;
  const progressPct =
    sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4 pb-28">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="font-600 mb-3 flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--coral)]"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className="font-900 text-xl text-[var(--text-primary)]">{detail.name}</h1>
        {detail.description && (
          <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
            {detail.description}
          </p>
        )}
        <div className="font-600 mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <Users size={11} /> {detail.enrollments.length} học viên
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={11} /> {sessions.length} buổi học
          </span>
          {activeCount > 0 && (
            <span className="font-700 flex items-center gap-1 text-green-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> {activeCount}{" "}
              đang mở
            </span>
          )}
          {!isTeacher && (
            <span className="text-[var(--text-secondary)]">GV: {detail.teacher.displayName}</span>
          )}
        </div>
      </div>

      {/* Progress bar (student view or teacher overview) */}
      {sessions.length > 0 && (
        <div className="rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3">
          <div className="font-700 mb-2 flex justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Tiến độ giáo án</span>
            <span className="text-[var(--coral)]">
              {completedCount}/{sessions.length} buổi
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--coral)] to-[var(--mint-dark)] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="font-600 mt-1.5 flex justify-between text-[10px] text-[var(--text-secondary)]">
            <span>{progressPct}% hoàn thành</span>
            {activeCount > 0 && <span className="text-green-600">{activeCount} đang diễn ra</span>}
          </div>
        </div>
      )}

      {/* Meet Link card */}
      {(isTeacher || detail.meetLink) && (
        <div className="rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3">
          {!editingMeetLink ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Video size={18} className="text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-800 text-xs tracking-wide text-[var(--text-secondary)] uppercase">
                  Link học trực tuyến
                </p>
                {detail.meetLink ? (
                  <a
                    href={detail.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-700 mt-0.5 flex items-center gap-1 truncate text-sm text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="truncate">{detail.meetLink}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                ) : (
                  <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
                    Chưa có link
                  </p>
                )}
              </div>
              {isTeacher && (
                <button
                  onClick={startEditMeetLink}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-blue-300 hover:text-blue-500"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-800 flex items-center gap-1.5 text-xs tracking-wide text-[var(--text-secondary)] uppercase">
                <Video size={12} /> Link học trực tuyến
              </p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={meetLinkInput}
                  onChange={(e) => setMeetLinkInput(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="font-600 flex-1 rounded-xl border-2 border-blue-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveMeetLink}
                  disabled={savingMeetLink}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  {savingMeetLink ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                </button>
                <button
                  onClick={() => setEditingMeetLink(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--cream)]"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="font-600 text-[10px] text-[var(--text-secondary)]">
                Xóa trắng để bỏ link. Hỗ trợ Google Meet, Zoom, Microsoft Teams,...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-[var(--cream)] p-1">
        {(["sessions", "students"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-700 flex-1 rounded-xl py-2 text-sm transition-all ${tab === t ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"}`}
          >
            {t === "sessions"
              ? `📚 Giáo án (${sessions.length})`
              : `👥 Học viên (${detail.enrollments.length})`}
          </button>
        ))}
      </div>

      {/* Sessions tab */}
      {tab === "sessions" && (
        <>
          {/* Teacher: add session */}
          {isTeacher && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="font-700 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--coral)]/40 py-3 text-sm text-[var(--coral)] transition-colors hover:bg-[var(--coral-light)]"
            >
              <Plus size={16} /> Thêm buổi học
            </button>
          )}

          {showForm && (
            <form
              onSubmit={handleCreateSession}
              className="animate-slide-up space-y-3 rounded-3xl border-2 border-[var(--coral)]/40 bg-white p-4"
            >
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tên buổi học (VD: Bài 1 — Hiragana cơ bản)"
                className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
              />
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả (tùy chọn)"
                className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
              />
              <div>
                <label className="font-700 mb-1 block text-xs text-[var(--text-secondary)]">
                  Ngày học (tùy chọn)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3 text-sm text-white disabled:opacity-50"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : "Tạo buổi học"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="font-700 rounded-2xl border-2 border-[var(--border)] px-5 py-3 text-sm text-[var(--text-secondary)]"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {sessions.length === 0 ? (
            <p className="font-600 py-8 text-center text-sm text-[var(--text-secondary)]">
              {isTeacher
                ? 'Nhấn "Thêm buổi học" để xây dựng giáo án.'
                : "Giáo viên chưa thêm buổi học nào."}
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-[var(--border)]" />
              <div className="space-y-3 pl-10">
                {sessions.map((s, index) => (
                  <SessionTimelineCard
                    key={s.id}
                    session={s}
                    index={index + 1}
                    isTeacher={isTeacher}
                    myId={myId}
                    onOpen={() => router.push(`/classroom/${id}/session/${s.id}`)}
                    onDelete={() => setDeleteTarget({ id: s.id, title: s.title })}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Students tab */}
      {tab === "students" && (
        <div className="space-y-2">
          {detail.enrollments.length === 0 ? (
            <p className="font-600 py-8 text-center text-sm text-[var(--text-secondary)]">
              Chưa có học viên. Chia sẻ mã mời{" "}
              <strong className="text-[var(--coral)]">{detail.inviteCode}</strong> để mời vào lớp.
            </p>
          ) : (
            detail.enrollments.map((e) => (
              <div
                key={e.id}
                onClick={() => isTeacher && router.push(`/classroom/${id}/student/${e.student.id}`)}
                className={`flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 transition-all ${
                  isTeacher ? "cursor-pointer hover:border-[var(--coral)]/50 hover:shadow-md" : ""
                }`}
              >
                <div className="font-900 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--coral-light)] text-lg text-[var(--coral)]">
                  {e.student.displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-700 truncate text-sm text-[var(--text-primary)]">
                    {e.student.displayName ?? "Học viên"}
                  </p>
                  <p className="font-600 text-xs text-[var(--text-secondary)]">
                    ⭐ {e.student.totalXP} XP · 🔥 {e.student.streak} ngày
                  </p>
                </div>
                {isTeacher && (
                  <ChevronRight size={16} className="shrink-0 text-[var(--text-secondary)]" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirm delete session dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="animate-slide-up relative w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                🗑️
              </div>
              <h2 className="font-900 text-lg text-[var(--text-primary)]">Xóa buổi học?</h2>
              <p className="font-600 text-sm leading-relaxed text-[var(--text-secondary)]">
                Buổi học{" "}
                <span className="font-800 text-[var(--text-primary)]">
                  &ldquo;{deleteTarget.title}&rdquo;
                </span>{" "}
                và toàn bộ bài tập, bài nộp liên quan sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="font-800 flex-1 rounded-2xl border-2 border-[var(--border)] py-3 text-sm text-[var(--text-secondary)] transition-all hover:bg-[var(--cream)]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteSession(deleteTarget.id)}
                className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-600 bg-red-500 py-3 text-sm text-white transition-all hover:bg-red-600 active:scale-[0.98]"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Session Timeline Card ────────────────────────────────────────────────────

function SessionTimelineCard({
  session,
  index,
  isTeacher,
  myId,
  onOpen,
  onDelete,
}: {
  session: Session;
  index: number;
  isTeacher: boolean;
  myId: string;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const cfg = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG];

  // Student progress: how many assignments have they submitted
  const assignments = session.assignments ?? [];
  const submittedCount = assignments.filter((a) =>
    a.submissions.some((s) => s.studentId === myId)
  ).length;
  const canAccess = session.status !== "DRAFT" || isTeacher;

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div
        className={`absolute top-4 -left-6 h-3 w-3 rounded-full border-2 border-white shadow ${cfg.dot}`}
      />

      <div
        onClick={canAccess ? onOpen : undefined}
        className={`rounded-2xl border-2 bg-white p-4 transition-all ${
          canAccess
            ? "cursor-pointer border-[var(--border)] hover:border-[var(--coral)]/50 hover:shadow-md"
            : "cursor-default border-[var(--border)] opacity-60"
        }`}
      >
        <div className="flex items-start gap-2">
          {/* Index badge */}
          <span className="font-900 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--cream)] text-xs text-[var(--text-secondary)]">
            {index}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-800 text-[var(--text-primary)]">{session.title}</p>
              <span
                className={`font-700 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${cfg.color}`}
              >
                {cfg.icon} {cfg.label}
              </span>
            </div>
            {session.description && (
              <p className="font-600 mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
                {session.description}
              </p>
            )}

            <div className="font-600 mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <BookOpen size={11} /> {session._count.assignments} bài tập
              </span>
              {session.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {new Date(session.scheduledAt).toLocaleDateString("vi-VN")}
                </span>
              )}
              {/* Student progress within session */}
              {!isTeacher && assignments.length > 0 && (
                <span
                  className={`font-700 flex items-center gap-1 ${submittedCount === assignments.length ? "text-[var(--mint-dark)]" : "text-[var(--coral)]"}`}
                >
                  <CheckCircle2 size={11} /> {submittedCount}/{assignments.length} đã nộp
                </span>
              )}
            </div>
          </div>

          {canAccess && (
            <ChevronRight size={16} className="mt-1 shrink-0 text-[var(--text-secondary)]" />
          )}
        </div>

        {/* Teacher controls */}
        {isTeacher && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex justify-end border-t border-[var(--border)] pt-3"
          >
            <button
              onClick={onDelete}
              className="font-700 rounded-xl border-2 border-red-200 px-3 py-1.5 text-xs text-red-400 hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4 px-4 pt-4">
      <div className="h-6 w-1/2 rounded-xl bg-[var(--border)]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-3xl border-2 border-[var(--border)] bg-white" />
      ))}
    </div>
  );
}
