"use client";

/**
 * NavBar — Role-aware bottom navigation
 * Teacher: Home | Classroom | Quiz | Profile
 * Student: Home | Learn | My Classes | Quiz | Profile
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "@/app/actions/auth";
import { Home, BookOpen, Zap, User, School, ClipboardList } from "lucide-react";

const studentNav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/learn", label: "Học", icon: BookOpen },
  { href: "/my-classes", label: "Lớp học", icon: ClipboardList },
  { href: "/quiz", label: "Quiz", icon: Zap },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

const teacherNav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/classroom", label: "Lớp học", icon: School },
  { href: "/quiz", label: "Quiz", icon: Zap },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

export default function NavBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  useEffect(() => {
    getProfile().then((p) => {
      if (p) setRole(p.role);
    });
  }, []);

  // Hide NavBar on auth pages
  if (pathname.startsWith("/auth")) return null;

  const navItems = role === "TEACHER" ? teacherNav : studentNav;

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t-2 border-[var(--border)] bg-white shadow-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-[var(--coral-light)] text-[var(--coral)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--coral-light)] hover:text-[var(--coral)]"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "scale-110" : ""}
              />
              <span className={`text-[10px] font-${isActive ? "800" : "600"} leading-none`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
