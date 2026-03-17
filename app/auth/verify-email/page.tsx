/**
 * Post-signup page — instructs user to verify their email
 */
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <p className="text-5xl">📬</p>
        <h1 className="font-900 text-xl text-[var(--text-primary)]">Kiểm tra email của bạn!</h1>
        <p className="font-600 text-sm text-[var(--text-secondary)]">
          Chúng tôi đã gửi email xác nhận. Nhấn vào link trong email để kích hoạt tài khoản.
        </p>
        <Link
          href="/auth/login"
          className="font-700 mt-4 inline-block text-sm text-[var(--coral)] hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
