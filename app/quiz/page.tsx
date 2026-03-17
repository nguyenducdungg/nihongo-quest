import Link from "next/link";
import { Zap, Sliders, PenLine, BookMarked, ChevronRight } from "lucide-react";

/**
 * Quiz Hub — Entry point for all quiz/flashcard modes
 */
export default function QuizHubPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
      <header>
        <h1 className="font-900 text-2xl text-[var(--text-primary)]">Quiz ⚡</h1>
        <p className="font-600 mt-1 text-sm text-[var(--text-secondary)]">Chọn chế độ luyện tập</p>
      </header>

      <div className="space-y-3">
        <HubCard
          href="/quiz/roadmap"
          icon={<Zap size={22} className="text-white" />}
          iconBg="bg-[var(--coral)]"
          title="Quiz theo lộ trình"
          desc="Câu hỏi tự động theo bài học hiện tại"
          badge="Gợi ý"
        />
        <HubCard
          href="/quiz/builder"
          icon={<Sliders size={22} className="text-white" />}
          iconBg="bg-blue-500"
          title="Tạo quiz từ nội dung có sẵn"
          desc="Chọn bảng chữ cái, nhóm âm hoặc chủ đề từ vựng"
        />
        <HubCard
          href="/quiz/custom"
          icon={<PenLine size={22} className="text-white" />}
          iconBg="bg-[var(--mint-dark)]"
          title="Quiz tự tạo"
          desc="Tự thêm câu hỏi & đáp án của riêng bạn"
        />
        <HubCard
          href="/quiz/flashcard"
          icon={<BookMarked size={22} className="text-white" />}
          iconBg="bg-[var(--yellow-dark)]"
          title="Flashcard tự tạo"
          desc="Tạo bộ thẻ học với mặt trước / mặt sau tùy ý"
        />
      </div>
    </div>
  );
}

function HubCard({
  href,
  icon,
  iconBg,
  title,
  desc,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border-2 border-[var(--border)] bg-white p-4 transition-all duration-200 hover:border-[var(--coral)]/50 hover:shadow-md active:scale-[0.98]"
    >
      <div className={`h-12 w-12 rounded-2xl ${iconBg} flex shrink-0 items-center justify-center`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-800 text-sm text-[var(--text-primary)]">{title}</p>
          {badge && (
            <span className="font-700 rounded-full bg-[var(--yellow)] px-2 py-0.5 text-[10px] text-[var(--text-primary)]">
              {badge}
            </span>
          )}
        </div>
        <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">{desc}</p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-[var(--text-secondary)]" />
    </Link>
  );
}
