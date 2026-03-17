"use client";

/**
 * Teacher Classroom Hub — list all classrooms, create new ones
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMyClassrooms, createClassroom, deleteClassroom } from "@/app/actions/classroom";
import {
  School,
  Plus,
  Trash2,
  Users,
  BookOpen,
  Copy,
  Check,
  Loader2,
  MoreVertical,
  Key,
} from "lucide-react";

type ClassroomItem = Awaited<ReturnType<typeof getMyClassrooms>>[number];

export default function ClassroomPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassroomItem | null>(null);

  const refresh = useCallback(() => {
    getMyClassrooms().then((data) => {
      setClassrooms(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await createClassroom(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    setShowForm(false);
    refresh();
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await deleteClassroom(id);
    setDeleteTarget(null);
    refresh();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-900 text-2xl text-[var(--text-primary)]">Lớp học của tôi 🏫</h1>
          <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
            {classrooms.length} lớp học
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-700 flex items-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] px-4 py-2 text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} /> Tạo lớp
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="animate-slide-up space-y-3 rounded-3xl border-2 border-[var(--coral)]/40 bg-white p-5"
        >
          <p className="font-800 text-[var(--text-primary)]">Tạo lớp học mới</p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên lớp học (VD: Nhật ngữ N5 - Thứ 2)"
            className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (tùy chọn)"
            className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3 text-sm text-white disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : "Tạo lớp"}
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

      {/* Classroom list */}
      {classrooms.length === 0 ? (
        <EmptyState
          icon={<School size={40} />}
          title="Chưa có lớp học nào"
          desc='Nhấn "Tạo lớp" để bắt đầu quản lý học viên của bạn.'
        />
      ) : (
        <div className="space-y-3">
          {classrooms.map((c) => (
            <ClassroomCard
              key={c.id}
              classroom={c}
              onOpen={() => router.push(`/classroom/${c.id}`)}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Confirm delete classroom dialog */}
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
              <h2 className="font-900 text-lg text-[var(--text-primary)]">Xóa lớp học?</h2>
              <p className="font-600 text-sm leading-relaxed text-[var(--text-secondary)]">
                Lớp{" "}
                <span className="font-800 text-[var(--text-primary)]">
                  &ldquo;{deleteTarget.name}&rdquo;
                </span>{" "}
                và toàn bộ buổi học, bài tập, bài nộp sẽ bị xóa vĩnh viễn.
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
                onClick={() => handleDelete(deleteTarget.id)}
                className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-600 bg-red-500 py-3 text-sm text-white transition-all hover:bg-red-600 active:scale-[0.98]"
              >
                <Trash2 size={14} /> Xóa lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassroomCard({
  classroom,
  onOpen,
  onDelete,
}: {
  classroom: ClassroomItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(classroom.inviteCode);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer rounded-3xl border-2 border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--coral)]/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-800 truncate text-[var(--text-primary)]">{classroom.name}</p>
          {classroom.description && (
            <p className="font-600 mt-0.5 truncate text-xs text-[var(--text-secondary)]">
              {classroom.description}
            </p>
          )}
          <div className="font-600 mt-2 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Users size={12} /> {classroom._count.enrollments} học viên
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {classroom._count.sessions} buổi học
            </span>
          </div>
        </div>

        {/* "..." menu */}
        <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--cream)]"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="animate-slide-up absolute top-9 right-0 z-20 w-48 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-white shadow-lg">
              <button
                onClick={copyCode}
                className="font-700 flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--cream)]"
              >
                {copied ? (
                  <Check size={15} className="text-green-500" />
                ) : (
                  <Key size={15} className="text-[var(--coral)]" />
                )}
                <span>{copied ? "Đã sao chép!" : "Sao chép mã mời"}</span>
                {!copied && (
                  <code className="font-900 ml-auto text-xs tracking-widest text-[var(--coral)]">
                    {classroom.inviteCode}
                  </code>
                )}
              </button>
              <div className="h-px bg-[var(--border)]" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                className="font-700 flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 size={15} /> Xóa lớp học
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="space-y-3 rounded-3xl border-2 border-[var(--border)] bg-white p-10 text-center">
      <div className="flex justify-center text-[var(--text-secondary)]/30">{icon}</div>
      <p className="font-800 text-[var(--text-primary)]">{title}</p>
      <p className="font-600 text-sm text-[var(--text-secondary)]">{desc}</p>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-3 px-4 pt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-3xl border-2 border-[var(--border)] bg-white" />
      ))}
    </div>
  );
}
