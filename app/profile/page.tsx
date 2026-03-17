"use client";

/**
 * Profile page — Shows user stats, completed lessons, role badge, and sign-out
 */

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/useProgress";
import { getProfile, signOut } from "@/app/actions/auth";
import { roadmapLessons } from "@/data/roadmap";
import XPBar from "@/components/shared/XPBar";
import StreakBadge from "@/components/shared/StreakBadge";
import { LogOut, GraduationCap, BookOpen } from "lucide-react";

export default function ProfilePage() {
  const { progress, level, xpProgress } = useProgress();
  const [displayName, setDisplayName] = useState("Học viên");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  useEffect(() => {
    getProfile().then((p) => {
      if (p) {
        setDisplayName(p.displayName ?? "Học viên");
        setRole(p.role);
      }
    });
  }, []);

  const { current, needed } = xpProgress;
  const completedLessons = roadmapLessons.filter((l) => progress.completedLessons.includes(l.id));
  const completionRate = Math.round((completedLessons.length / roadmapLessons.length) * 100);

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4">
      <h1 className="font-900 text-2xl text-[var(--text-primary)]">Hồ sơ 👤</h1>

      {/* Avatar + Info */}
      <div className="flex items-center gap-4 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <div
          className="font-900 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
          style={{ background: "var(--coral-light)", color: "var(--coral)" }}
        >
          {role === "TEACHER" ? "👨‍🏫" : "🎌"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-800 truncate text-[var(--text-primary)]">{displayName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`font-700 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                role === "TEACHER"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-[var(--coral-light)] text-[var(--coral)]"
              }`}
            >
              {role === "TEACHER" ? (
                <>
                  <GraduationCap size={11} /> Giáo viên
                </>
              ) : (
                <>
                  <BookOpen size={11} /> Học viên
                </>
              )}
            </span>
            <span className="font-700 rounded-full bg-[var(--yellow)] px-2 py-0.5 text-xs text-[var(--text-primary)]">
              Level {level}
            </span>
            <StreakBadge streak={progress.streak} />
          </div>
        </div>
      </div>

      {/* XP */}
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-4">
        <p className="font-700 mb-3 text-sm text-[var(--text-primary)]">Kinh nghiệm (XP)</p>
        <XPBar current={current} needed={needed} level={level} />
        <p className="font-600 mt-2 text-center text-xs text-[var(--text-secondary)]">
          Tổng: <strong className="text-[var(--coral)]">{progress.totalXP} XP</strong>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatBlock
          emoji="✅"
          value={completedLessons.length}
          label="Bài hoàn thành"
          color="var(--mint-dark)"
        />
        <StatBlock
          emoji="📊"
          value={`${completionRate}%`}
          label="Hoàn thành lộ trình"
          color="var(--coral)"
        />
        <StatBlock
          emoji="🔥"
          value={progress.streak}
          label="Ngày liên tiếp"
          color="var(--yellow-dark)"
        />
        <StatBlock emoji="⭐" value={progress.totalXP} label="Tổng XP" color="var(--purple)" />
      </div>

      {/* Completed lessons */}
      {completedLessons.length > 0 && (
        <section>
          <h2 className="font-800 mb-3 text-base text-[var(--text-primary)]">
            Bài học đã hoàn thành ({completedLessons.length})
          </h2>
          <div className="space-y-2">
            {completedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-[var(--mint)]/30 bg-white p-3"
              >
                <span className="text-xl">{lesson.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-700 truncate text-sm text-[var(--text-primary)]">
                    {lesson.title}
                  </p>
                  <p className="kana-text truncate text-xs text-[var(--text-secondary)]">
                    {lesson.subtitle}
                  </p>
                </div>
                <span className="font-700 shrink-0 rounded-full bg-[var(--mint)]/10 px-2 py-0.5 text-xs text-[var(--mint-dark)]">
                  +{lesson.xp} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="font-700 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--border)] py-3 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--border)]"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </form>
    </div>
  );
}

function StatBlock({
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
    <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center">
      <span className="block text-2xl">{emoji}</span>
      <p className="font-900 mt-1 text-2xl" style={{ color }}>
        {value}
      </p>
      <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
