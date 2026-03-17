"use client";

/**
 * Home page — role-aware dashboard
 * Teacher: stats + quick classroom access
 * Student: XP progress + pending assignments + personal roadmap
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/useProgress";
import { getProfile } from "@/app/actions/auth";
import { getMyAssignments } from "@/app/actions/assignment";
import { getTeacherStats } from "@/app/actions/stats";
import XPBar from "@/components/shared/XPBar";
import StreakBadge from "@/components/shared/StreakBadge";
import RoadmapFetcher from "@/components/roadmap/RoadmapFetcher";
import {
  ChevronRight,
  Clock,
  Copy,
  Check,
  School,
  Users,
  BookOpen,
  ClipboardList,
  Star,
  AlertCircle,
} from "lucide-react";

type Assignment = Awaited<ReturnType<typeof getMyAssignments>>[number];
type TeacherStats = Awaited<ReturnType<typeof getTeacherStats>>;

export default function HomePage() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [displayName, setDisplayName] = useState("");

  const router = useRouter();

  useEffect(() => {
    getProfile().then((p) => {
      if (!p) {
        router.replace("/auth/login");
        return;
      }
      setRole(p.role);
      setDisplayName(p.displayName ?? "");
    });
  }, [router]);

  if (role === null) return <HomeLoader />;

  if (role === "TEACHER") return <TeacherDashboard displayName={displayName} />;
  return <StudentDashboard displayName={displayName} />;
}

// ── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [stats, setStats] = useState<TeacherStats>(null);

  useEffect(() => {
    getTeacherStats().then(setStats);
  }, []);

  const firstName = displayName.split(" ").at(-1) || "Thầy/Cô";

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-4 pb-28">
      {/* Greeting */}
      <header>
        <h1 className="font-900 text-2xl text-[var(--text-primary)]">Xin chào, {firstName}! 👨‍🏫</h1>
        <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
          {stats?.pendingGrades ? (
            <span className="text-[var(--coral)]">{stats.pendingGrades} bài chờ chấm điểm</span>
          ) : (
            "Không có bài nào chờ chấm"
          )}
        </p>
      </header>

      {/* Pending grades alert */}
      {(stats?.pendingGrades ?? 0) > 0 && (
        <Link
          href="/classroom"
          className="flex items-center gap-3 rounded-2xl bg-[var(--coral)] px-4 py-3 text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <AlertCircle size={20} className="shrink-0" />
          <div className="flex-1">
            <p className="font-800 text-sm">{stats!.pendingGrades} bài nộp chờ chấm điểm</p>
            <p className="font-600 text-xs text-white/80">Nhấn để vào lớp học</p>
          </div>
          <ChevronRight size={18} className="shrink-0" />
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<School size={20} />}
          value={stats?.totalClassrooms ?? 0}
          label="Lớp học"
          color="var(--coral)"
          href="/classroom"
        />
        <StatCard
          icon={<Users size={20} />}
          value={stats?.totalStudents ?? 0}
          label="Học viên"
          color="var(--mint-dark)"
        />
        <StatCard
          icon={<BookOpen size={20} />}
          value={stats?.totalSessions ?? 0}
          label="Buổi học"
          color="var(--yellow-dark)"
        />
        <StatCard
          icon={<ClipboardList size={20} />}
          value={stats?.totalAssignments ?? 0}
          label="Bài tập"
          color="var(--purple)"
        />
      </div>

      {/* Active sessions alert */}
      {(stats?.activeSessions ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3">
          <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-green-500" />
          <p className="font-700 text-sm text-green-700">
            {stats!.activeSessions} buổi học đang mở — học viên có thể làm bài
          </p>
        </div>
      )}

      {/* Recent classrooms */}
      {(stats?.recentClassrooms.length ?? 0) > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-800 text-lg text-[var(--text-primary)]">Lớp học gần đây</h2>
            <Link
              href="/classroom"
              className="font-700 text-sm text-[var(--coral)] hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-2">
            {stats!.recentClassrooms.map((c) => (
              <ClassroomMiniCard
                key={c.id}
                classroom={c}
                onClick={() => router.push(`/classroom/${c.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {stats && stats.totalClassrooms === 0 && (
        <div className="space-y-3 rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-10 text-center">
          <p className="text-4xl">🏫</p>
          <p className="font-800 text-[var(--text-primary)]">Chưa có lớp học nào</p>
          <p className="font-600 text-sm text-[var(--text-secondary)]">
            Tạo lớp học để bắt đầu quản lý học viên và giao bài.
          </p>
          <Link
            href="/classroom"
            className="font-800 mt-2 inline-block rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] px-6 py-2.5 text-sm text-white transition-all hover:scale-[1.02]"
          >
            Tạo lớp học đầu tiên
          </Link>
        </div>
      )}

      {/* Quick links */}
      <section>
        <h2 className="font-800 mb-3 text-lg text-[var(--text-primary)]">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickLink
            href="/classroom"
            emoji="🏫"
            title="Quản lý lớp"
            desc="Tạo lớp, thêm buổi học"
          />
          <QuickLink href="/quiz" emoji="📝" title="Quiz có sẵn" desc="Dùng nội dung ứng dụng" />
        </div>
      </section>
    </div>
  );
}

// ── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ displayName }: { displayName: string }) {
  const { progress, level, xpProgress } = useProgress();
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    getMyAssignments().then((asgns) =>
      setPendingAssignments(asgns.filter((a) => a.submissions.length === 0))
    );
  }, []);

  const { current, needed } = xpProgress;
  const completedCount = progress.completedLessons.length;
  const firstName = displayName.split(" ").at(-1) || "bạn";

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-4 pb-28">
      {/* Hero */}
      <header>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-900 text-2xl text-[var(--text-primary)]">
              {displayName ? `Xin chào, ${firstName}! 🌸` : "Nihongo Quest 🌸"}
            </h1>
            <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
              {completedCount === 0
                ? "Hành trình của bạn bắt đầu hôm nay!"
                : `${completedCount} bài học hoàn thành — Tiếp tục nào!`}
            </p>
          </div>
          <StreakBadge streak={progress.streak} />
        </div>
      </header>

      {/* Pending assignments banner */}
      {pendingAssignments.length > 0 && (
        <Link
          href="/my-classes"
          className="flex items-center gap-3 rounded-2xl bg-[var(--coral)] px-4 py-3 text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="font-900 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">
            {pendingAssignments.length}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-800 text-sm">Bài tập đang chờ</p>
            <p className="font-600 truncate text-xs text-white/80">
              {pendingAssignments[0].title}
              {pendingAssignments.length > 1 ? ` và ${pendingAssignments.length - 1} bài khác` : ""}
            </p>
          </div>
          <ChevronRight size={18} className="shrink-0" />
        </Link>
      )}

      {/* XP Progress */}
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-700 text-sm text-[var(--text-primary)]">Tiến độ cá nhân</span>
          <span className="font-700 rounded-full bg-[var(--coral-light)] px-2 py-0.5 text-xs text-[var(--coral)]">
            {progress.totalXP} XP tích lũy
          </span>
        </div>
        <XPBar current={current} needed={needed} level={level} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat emoji="📚" value={completedCount} label="Bài học" color="var(--coral)" />
        <MiniStat emoji="⭐" value={progress.totalXP} label="Tổng XP" color="var(--yellow-dark)" />
        <MiniStat emoji="🎯" value={`Lv.${level}`} label="Cấp độ" color="var(--mint-dark)" />
      </div>

      {/* Personal practice roadmap */}
      <section>
        <h2 className="font-800 mb-3 text-lg text-[var(--text-primary)]">Tự luyện cá nhân</h2>
        <RoadmapFetcher />
      </section>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  color,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--coral)]/40">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="font-900 text-2xl" style={{ color }}>
          {value}
        </p>
        <p className="font-600 text-xs text-[var(--text-secondary)]">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

function ClassroomMiniCard({
  classroom,
  onClick,
}: {
  classroom: NonNullable<TeacherStats>["recentClassrooms"][number];
  onClick: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(classroom.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3 transition-all hover:border-[var(--coral)]/50 hover:shadow-sm"
    >
      <div className="font-900 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--coral-light)] text-lg text-[var(--coral)]">
        {classroom.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-800 truncate text-sm text-[var(--text-primary)]">{classroom.name}</p>
        <div className="font-600 mt-0.5 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <Users size={10} />
            {classroom.studentCount}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} />
            {classroom.sessionCount} buổi
          </span>
          {classroom.activeSessions > 0 && (
            <span className="font-700 flex items-center gap-1 text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {classroom.activeSessions} đang mở
            </span>
          )}
        </div>
      </div>
      <button
        onClick={copyCode}
        className="shrink-0 p-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--coral)]"
      >
        {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
      </button>
      <ChevronRight size={16} className="shrink-0 text-[var(--text-secondary)]" />
    </div>
  );
}

function QuickLink({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--coral)]/50 hover:shadow-sm"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-800 text-sm text-[var(--text-primary)]">{title}</p>
        <p className="font-600 text-xs text-[var(--text-secondary)]">{desc}</p>
      </div>
    </Link>
  );
}

function MiniStat({
  emoji,
  value,
  label,
  color,
}: {
  emoji: string;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center">
      <span className="block text-xl">{emoji}</span>
      <p className="font-900 mt-1 text-lg" style={{ color }}>
        {value}
      </p>
      <p className="font-600 text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function HomeLoader() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4 px-4 pt-6 pb-28">
      <div className="h-7 w-48 rounded-xl bg-[var(--border)]" />
      <div className="h-4 w-32 rounded-xl bg-[var(--border)]" />
      <div className="h-24 rounded-3xl border-2 border-[var(--border)] bg-white" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-3xl border-2 border-[var(--border)] bg-white" />
        <div className="h-20 rounded-3xl border-2 border-[var(--border)] bg-white" />
      </div>
      <div className="h-36 rounded-3xl border-2 border-[var(--border)] bg-white" />
    </div>
  );
}
