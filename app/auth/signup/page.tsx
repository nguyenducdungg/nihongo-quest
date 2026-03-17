"use client";

/**
 * Signup page — Email/password registration with role selection (Student or Teacher)
 * Role is stored in user_metadata and synced to Profile table via DB trigger / Server Action
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";

type Role = "STUDENT" | "TEACHER";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Role>("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          role, // Passed to user_metadata → used by DB trigger to create Profile
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/auth/verify-email");
  };

  const handleGoogle = async () => {
    setLoading(true);
    // Store desired role in state before OAuth redirect
    sessionStorage.setItem("signup_role", role);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?role=${role}` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-4xl">🌸</p>
          <h1 className="font-900 mt-2 text-2xl text-[var(--text-primary)]">Tạo tài khoản</h1>
          <p className="font-600 mt-1 text-sm text-[var(--text-secondary)]">Chọn vai trò của bạn</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            selected={role === "STUDENT"}
            onClick={() => setRole("STUDENT")}
            icon={<BookOpen size={24} />}
            title="Học viên"
            desc="Học theo lộ trình & làm bài tập"
          />
          <RoleCard
            selected={role === "TEACHER"}
            onClick={() => setRole("TEACHER")}
            icon={<GraduationCap size={24} />}
            title="Giáo viên"
            desc="Quản lý lớp & giao bài tập"
          />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="font-700 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white py-3 text-[var(--text-primary)] transition-all hover:border-gray-400 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Đăng ký với Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="font-600 text-xs text-[var(--text-secondary)]">hoặc</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="Tên hiển thị"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="font-600 w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-[var(--coral)] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="font-600 w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-[var(--coral)] focus:outline-none"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="font-600 w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 pr-12 text-[var(--text-primary)] transition-colors focus:border-[var(--coral)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[var(--text-secondary)]"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="font-600 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3.5 text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Tạo tài khoản"}
          </button>
        </form>

        <p className="font-600 text-center text-sm text-[var(--text-secondary)]">
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className="font-700 text-[var(--coral)] hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-[var(--coral)] bg-[var(--coral-light)]"
          : "border-[var(--border)] bg-white hover:border-[var(--coral)]/50"
      }`}
    >
      <div className={`mb-2 ${selected ? "text-[var(--coral)]" : "text-[var(--text-secondary)]"}`}>
        {icon}
      </div>
      <p className="font-800 text-sm text-[var(--text-primary)]">{title}</p>
      <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">{desc}</p>
    </button>
  );
}
