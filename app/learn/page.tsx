"use client";

/**
 * Learn index page — Shows all lesson categories grouped by type
 * Applies Hick's Law: grouped into sections, not a flat overwhelming list
 */

import Link from "next/link";
import { hiraganaGroups } from "@/data/hiragana";
import { vocabTopics } from "@/data/vocabulary";
import { Sparkles } from "lucide-react";

const basicGroups = hiraganaGroups.filter((g) => g.category === "basic");
const dakutenGroups = hiraganaGroups.filter((g) => g.category === "dakuten");
const handakutenGroups = hiraganaGroups.filter((g) => g.category === "handakuten");
const youonGroups = hiraganaGroups.filter((g) => g.category === "youon");

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pb-4">
      <header className="pt-4">
        <h1 className="font-900 text-2xl text-[var(--text-primary)]">Học 📚</h1>
        <p className="font-600 mt-1 text-sm text-[var(--text-secondary)]">Chọn chủ đề để bắt đầu</p>
      </header>

      {/* Hiragana cơ bản */}
      <section>
        <SectionHeader icon="🌸" title="Hiragana cơ bản" badge="46 ký tự" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {basicGroups.map((g) => (
            <KanaLink key={g.key} groupKey={g.key} label={g.label} system="hiragana" />
          ))}
        </div>
      </section>

      {/* Âm đục */}
      <section>
        <SectionHeader icon="🔵" title="Âm đục (濁音)" badge="Dakuten ゛" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {dakutenGroups.map((g) => (
            <KanaLink
              key={g.key}
              groupKey={g.key}
              label={g.label}
              system="hiragana"
              accent="blue"
            />
          ))}
        </div>
      </section>

      {/* Âm nửa đục */}
      <section>
        <SectionHeader icon="🟣" title="Âm nửa đục (半濁音)" badge="Handakuten ゜" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {handakutenGroups.map((g) => (
            <KanaLink
              key={g.key}
              groupKey={g.key}
              label={g.label}
              system="hiragana"
              accent="purple"
            />
          ))}
        </div>
      </section>

      {/* Âm ghép */}
      <section>
        <SectionHeader icon="🌀" title="Âm ghép (拗音 Yōon)" badge="Kết hợp" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {youonGroups.map((g) => (
            <KanaLink
              key={g.key}
              groupKey={g.key}
              label={g.label}
              system="hiragana"
              accent="orange"
            />
          ))}
        </div>
      </section>

      {/* Katakana */}
      <section>
        <SectionHeader icon="⭐" title="Katakana" />
        <Link
          href="/learn/katakana?group=vowels"
          className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--mint)] hover:bg-[var(--mint)]/5"
        >
          <span className="kana-text text-2xl">カタカナ</span>
          <div>
            <p className="font-700 text-sm text-[var(--text-primary)]">Bắt đầu Katakana</p>
            <p className="text-xs text-[var(--text-secondary)]">Dùng cho từ nước ngoài</p>
          </div>
          <Sparkles size={16} className="ml-auto text-[var(--mint-dark)]" />
        </Link>
      </section>

      {/* Từ vựng */}
      <section>
        <SectionHeader icon="📖" title="Từ vựng" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {vocabTopics.map((topic) => (
            <Link
              key={topic.key}
              href={`/learn/vocabulary?topic=${topic.key}`}
              className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center transition-all duration-200 hover:border-[var(--yellow-dark)] hover:bg-[var(--yellow)]/10 active:scale-[0.97]"
            >
              <span className="block text-2xl">{topic.emoji}</span>
              <p className="font-700 mt-1 text-xs text-[var(--text-primary)]">{topic.label}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Lv.{topic.level}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, badge }: { icon: string; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <h2 className="font-800 text-base text-[var(--text-primary)]">{title}</h2>
      {badge && (
        <span className="font-700 rounded-full bg-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
          {badge}
        </span>
      )}
    </div>
  );
}

const accentStyles: Record<string, string> = {
  default: "hover:border-[var(--coral)] hover:bg-[var(--coral-light)]",
  blue: "hover:border-blue-400 hover:bg-blue-50",
  purple: "hover:border-purple-400 hover:bg-purple-50",
  orange: "hover:border-orange-400 hover:bg-orange-50",
};

function KanaLink({
  groupKey,
  label,
  system,
  accent = "default",
}: {
  groupKey: string;
  label: string;
  system: "hiragana" | "katakana";
  accent?: string;
}) {
  const [name, kana] = label.split(" (");
  return (
    <Link
      href={`/learn/${system}?group=${groupKey}`}
      className={`rounded-2xl border-2 border-[var(--border)] bg-white p-3 transition-all duration-200 active:scale-[0.97] ${accentStyles[accent] ?? accentStyles.default}`}
    >
      <p className="font-700 text-sm text-[var(--text-primary)]">{name}</p>
      {kana && (
        <p className="kana-text mt-0.5 text-xs text-[var(--text-secondary)]">
          {kana.replace(")", "")}
        </p>
      )}
    </Link>
  );
}
