import type { Metadata } from "next";
import { Nunito, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import { getProfile } from "@/app/actions/auth";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

// Use next/font instead of a render-blocking <link> tag
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nihongo Quest 🌸",
  description: "Học tiếng Nhật theo lộ trình — dành cho người mới bắt đầu",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch role server-side once per request — no client-side useEffect needed
  const profile = await getProfile();
  const role = profile?.role ?? null;

  return (
    <html lang="vi" className={`${nunito.variable} ${notoSansJP.variable}`}>
      <body className="min-h-screen bg-[var(--cream)]">
        <NavBar role={role} />
        <main className="pt-4 pb-24">{children}</main>
      </body>
    </html>
  );
}
