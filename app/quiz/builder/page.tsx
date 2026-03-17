"use client";

/**
 * Quiz Builder — Select kana groups / vocab topics to generate a custom quiz session
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play } from "lucide-react";
import { hiraganaData, hiraganaGroups } from "@/data/hiragana";
import { katakanaData } from "@/data/katakana";
import { vocabularyData, vocabTopics } from "@/data/vocabulary";
import { QuizQuestion } from "@/types";
import QuizContainer from "@/components/quiz/QuizContainer";
import { roadmapLessons } from "@/data/roadmap";

type Tab = "hiragana" | "katakana" | "vocab";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildKanaQuestions(groupKeys: string[], system: "hiragana" | "katakana"): QuizQuestion[] {
  const source = system === "hiragana" ? hiraganaData : katakanaData;
  const pool = source.filter((c) => groupKeys.includes(c.group));
  if (pool.length < 2) return [];
  return pool.map((char) => {
    const distractors = shuffle(
      source.filter((c) => c.romaji !== char.romaji).map((c) => c.romaji)
    ).slice(0, 3);
    return {
      id: `${system}-${char.kana}`,
      type: "kana-to-romaji" as const,
      prompt: char.kana,
      answer: char.romaji,
      choices: shuffle([char.romaji, ...distractors]),
    };
  });
}

function buildVocabQuestions(topicKeys: string[]): QuizQuestion[] {
  const pool = vocabularyData.filter((v) => topicKeys.includes(v.topic));
  if (pool.length < 2) return [];
  return pool.map((item) => {
    const distractors = shuffle(
      vocabularyData.filter((v) => v.meaning !== item.meaning).map((v) => v.meaning)
    ).slice(0, 3);
    return {
      id: `vocab-${item.japanese}`,
      type: "vocab-meaning" as const,
      prompt: item.japanese,
      answer: item.meaning,
      choices: shuffle([item.meaning, ...distractors]),
    };
  });
}

const dakutenGroups = hiraganaGroups.filter((g) => g.category === "dakuten");
const handakutenGroups = hiraganaGroups.filter((g) => g.category === "handakuten");
const youonGroups = hiraganaGroups.filter((g) => g.category === "youon");
const basicGroups = hiraganaGroups.filter((g) => g.category === "basic");

export default function QuizBuilderPage() {
  const [tab, setTab] = useState<Tab>("hiragana");
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);

  const toggleGroup = (key: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectAll = (keys: string[]) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });
  };

  const clearAll = () => setSelectedGroups(new Set());

  const startQuiz = () => {
    let qs: QuizQuestion[] = [];
    if (tab === "hiragana") qs = buildKanaQuestions([...selectedGroups], "hiragana");
    else if (tab === "katakana") qs = buildKanaQuestions([...selectedGroups], "katakana");
    else qs = buildVocabQuestions([...selectedGroups]);

    if (qs.length === 0) return;
    setQuestions(shuffle(qs));
  };

  const dummyLesson = roadmapLessons[0];

  if (questions) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4">
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => setQuestions(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="font-800 text-xl text-[var(--text-primary)]">Quiz tùy chọn ⚡</h1>
        </div>
        <QuizContainer
          questions={questions}
          lesson={{ ...dummyLesson, id: "builder-quiz", xp: 0 }}
          initialCompleted={false}
          hideXP
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/quiz"
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Tạo quiz từ nội dung</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-[var(--border)] p-1">
        {(["hiragana", "katakana", "vocab"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setSelectedGroups(new Set());
            }}
            className={`font-700 flex-1 rounded-xl py-2 text-sm transition-all ${
              tab === t ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"
            }`}
          >
            {t === "hiragana" ? "Hiragana" : t === "katakana" ? "Katakana" : "Từ vựng"}
          </button>
        ))}
      </div>

      {/* Group selector */}
      <div className="space-y-4">
        {tab !== "vocab" ? (
          <>
            <GroupSection
              title="Cơ bản"
              groups={basicGroups}
              selected={selectedGroups}
              onToggle={toggleGroup}
              onSelectAll={() => selectAll(basicGroups.map((g) => g.key))}
            />
            <GroupSection
              title="Âm đục (濁音)"
              groups={dakutenGroups}
              selected={selectedGroups}
              onToggle={toggleGroup}
              onSelectAll={() => selectAll(dakutenGroups.map((g) => g.key))}
            />
            <GroupSection
              title="Âm nửa đục (半濁音)"
              groups={handakutenGroups}
              selected={selectedGroups}
              onToggle={toggleGroup}
              onSelectAll={() => selectAll(handakutenGroups.map((g) => g.key))}
            />
            <GroupSection
              title="Âm ghép (拗音)"
              groups={youonGroups}
              selected={selectedGroups}
              onToggle={toggleGroup}
              onSelectAll={() => selectAll(youonGroups.map((g) => g.key))}
            />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {vocabTopics.map((topic) => {
              const checked = selectedGroups.has(topic.key);
              return (
                <button
                  key={topic.key}
                  onClick={() => toggleGroup(topic.key)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
                    checked
                      ? "border-[var(--yellow-dark)] bg-[var(--yellow)]/20"
                      : "border-[var(--border)] bg-white hover:border-[var(--yellow-dark)]"
                  }`}
                >
                  <span className="text-xl">{topic.emoji}</span>
                  <div>
                    <p className="font-700 text-sm text-[var(--text-primary)]">{topic.label}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      {vocabularyData.filter((v) => v.topic === topic.key).length} từ
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="space-y-2.5 pb-2">
        {selectedGroups.size > 0 && (
          <button
            onClick={clearAll}
            className="font-700 w-full rounded-2xl border-2 border-[var(--border)] py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--border)]"
          >
            Bỏ chọn tất cả ({selectedGroups.size} nhóm)
          </button>
        )}
        <button
          onClick={startQuiz}
          disabled={selectedGroups.size === 0}
          className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-4 text-base text-white transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={18} />
          Bắt đầu Quiz
          {selectedGroups.size > 0 && (
            <span className="text-sm opacity-80">
              (~
              {tab === "vocab"
                ? vocabularyData.filter((v) => selectedGroups.has(v.topic)).length
                : (tab === "hiragana" ? hiraganaData : katakanaData).filter((c) =>
                    selectedGroups.has(c.group)
                  ).length}{" "}
              câu)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function GroupSection({
  title,
  groups,
  selected,
  onToggle,
  onSelectAll,
}: {
  title: string;
  groups: { key: string; label: string }[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  onSelectAll: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-700 text-sm text-[var(--text-secondary)]">{title}</p>
        <button
          onClick={onSelectAll}
          className="font-700 text-xs text-[var(--coral)] hover:underline"
        >
          Chọn hết
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {groups.map((g) => {
          const [name, kana] = g.label.split(" (");
          const checked = selected.has(g.key);
          return (
            <button
              key={g.key}
              onClick={() => onToggle(g.key)}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                checked
                  ? "border-[var(--coral)] bg-[var(--coral-light)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--coral)]/50"
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  checked ? "border-[var(--coral)] bg-[var(--coral)]" : "border-gray-300"
                }`}
              >
                {checked && <span className="font-900 text-[10px] text-white">✓</span>}
              </div>
              <div className="min-w-0">
                <p className="font-700 truncate text-xs text-[var(--text-primary)]">{name}</p>
                {kana && (
                  <p className="kana-text text-[10px] text-[var(--text-secondary)]">
                    {kana.replace(")", "")}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
