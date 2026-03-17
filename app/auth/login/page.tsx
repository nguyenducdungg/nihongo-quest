"use client";

/**
 * Login page — Email/password + Google OAuth
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : error.message
      );
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <p className="text-4xl">🌸</p>
          <h1 className="font-900 mt-2 text-2xl text-[var(--text-primary)]">Nihongo Quest</h1>
          <p className="font-600 mt-1 text-sm text-[var(--text-secondary)]">
            Đăng nhập để tiếp tục học
          </p>
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
          Đăng nhập với Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="font-600 text-xs text-[var(--text-secondary)]">hoặc</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleLogin} className="space-y-3">
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
              placeholder="Mật khẩu"
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Đăng nhập"}
          </button>
        </form>

        <p className="font-600 text-center text-sm text-[var(--text-secondary)]">
          Chưa có tài khoản?{" "}
          <Link href="/auth/signup" className="font-700 text-[var(--coral)] hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
