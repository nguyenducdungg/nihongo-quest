"use client";

/**
 * Custom Quiz page — Create, manage and play user-defined quiz decks
 * Deck list → Create/Edit deck → Play quiz using QuizPresenter
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Trash2, Play, PenLine, X, Check } from "lucide-react";
import { getQuizDecks, saveQuizDeck, deleteQuizDeck } from "@/app/actions/decks";
import { generateId } from "@/lib/customData";
import { CustomQuizDeck, CustomQuizCard, QuizQuestion } from "@/types";
import QuizContainer from "@/components/quiz/QuizContainer";
import { roadmapLessons } from "@/data/roadmap";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestionsFromDeck(deck: CustomQuizDeck): QuizQuestion[] {
  if (deck.cards.length < 2) return [];
  return deck.cards.map((card) => {
    const distractors = shuffle(
      deck.cards.filter((c) => c.answer !== card.answer).map((c) => c.answer)
    ).slice(0, 3);
    // Pad with generic distractors if deck is small
    while (distractors.length < 3) distractors.push(`?${distractors.length}`);
    return {
      id: card.id,
      type: "vocab-meaning" as const,
      prompt: card.prompt,
      answer: card.answer,
      choices: shuffle([card.answer, ...distractors]),
    };
  });
}

type Screen = "list" | "edit" | "play";

export default function CustomQuizPage() {
  const [screen, setScreen] = useState<Screen>("list");
  const [decks, setDecks] = useState<CustomQuizDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<CustomQuizDeck | null>(null);
  const [playQuestions, setPlayQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    refreshDecks();
  }, []);

  const refreshDecks = () => getQuizDecks().then((d) => setDecks(d as unknown as CustomQuizDeck[]));

  const newDeck = () => {
    const deck: CustomQuizDeck = {
      id: generateId(),
      name: "Bộ quiz mới",
      cards: [],
      createdAt: new Date().toISOString(),
    };
    setActiveDeck(deck);
    setScreen("edit");
  };

  const editDeck = (deck: CustomQuizDeck) => {
    setActiveDeck({ ...deck });
    setScreen("edit");
  };

  const playDeck = (deck: CustomQuizDeck) => {
    const qs = buildQuestionsFromDeck(deck);
    if (qs.length === 0) return;
    setPlayQuestions(shuffle(qs));
    setActiveDeck(deck);
    setScreen("play");
  };

  const removeDeck = (id: string) => deleteQuizDeck(id).then(() => refreshDecks());

  if (screen === "play" && activeDeck) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen("list")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="font-800 truncate text-xl text-[var(--text-primary)]">
            {activeDeck.name}
          </h1>
        </div>
        <QuizContainer
          questions={playQuestions}
          lesson={{ ...roadmapLessons[0], id: activeDeck.id, xp: 0 }}
          initialCompleted={false}
          hideXP
        />
      </div>
    );
  }

  if (screen === "edit" && activeDeck) {
    return (
      <DeckEditor
        deck={activeDeck}
        onSave={(updated) => {
          saveQuizDeck(updated.id, updated.name, updated.cards).then(() => {
            refreshDecks();
            setScreen("list");
          });
        }}
        onCancel={() => setScreen("list")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/quiz"
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 className="font-800 text-xl text-[var(--text-primary)]">Quiz tự tạo</h1>
        </div>
        <button
          onClick={newDeck}
          className="font-700 flex items-center gap-1.5 rounded-xl bg-[var(--mint)] px-3 py-2 text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.97]"
        >
          <Plus size={16} /> Tạo mới
        </button>
      </div>

      {decks.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="Chưa có bộ quiz nào"
          desc="Tạo bộ quiz đầu tiên của bạn!"
          onAction={newDeck}
          actionLabel="Tạo ngay"
        />
      ) : (
        <div className="space-y-2.5">
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-800 truncate text-[var(--text-primary)]">{deck.name}</p>
                <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">
                  {deck.cards.length} câu hỏi
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => editDeck(deck)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--border)] transition-colors hover:bg-[var(--coral-light)]"
                >
                  <PenLine size={14} className="text-[var(--text-secondary)]" />
                </button>
                <button
                  onClick={() => playDeck(deck)}
                  disabled={deck.cards.length < 2}
                  className="font-700 flex items-center gap-1.5 rounded-xl bg-[var(--coral)] px-3 py-2 text-xs text-white transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40"
                >
                  <Play size={13} /> Chơi
                </button>
                <button
                  onClick={() => removeDeck(deck.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--border)] transition-colors hover:bg-red-100"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Deck Editor =====

function DeckEditor({
  deck,
  onSave,
  onCancel,
}: {
  deck: CustomQuizDeck;
  onSave: (d: CustomQuizDeck) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(deck.name);
  const [cards, setCards] = useState<CustomQuizCard[]>(deck.cards);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCard = () => {
    if (!prompt.trim() || !answer.trim()) return;
    if (editingId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, prompt: prompt.trim(), answer: answer.trim() } : c
        )
      );
      setEditingId(null);
    } else {
      setCards((prev) => [
        ...prev,
        { id: generateId(), prompt: prompt.trim(), answer: answer.trim() },
      ]);
    }
    setPrompt("");
    setAnswer("");
  };

  const startEdit = (card: CustomQuizCard) => {
    setEditingId(card.id);
    setPrompt(card.prompt);
    setAnswer(card.answer);
  };

  const removeCard = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id));

  const save = () => onSave({ ...deck, name: name.trim() || "Bộ quiz", cards });

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Chỉnh sửa quiz</h1>
      </div>

      {/* Deck name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên bộ quiz..."
        className="font-700 w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-[var(--coral)] focus:outline-none"
      />

      {/* Add card form */}
      <div className="space-y-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="font-800 text-sm text-[var(--text-primary)]">
          {editingId ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
        </p>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Câu hỏi / từ tiếng Nhật..."
          className="font-600 kana-text w-full rounded-xl border-2 border-[var(--border)] px-3 py-2.5 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
        />
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          placeholder="Đáp án / nghĩa tiếng Việt..."
          className="font-600 w-full rounded-xl border-2 border-[var(--border)] px-3 py-2.5 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
        />
        <div className="flex gap-2">
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setPrompt("");
                setAnswer("");
              }}
              className="font-700 flex-1 rounded-xl border-2 border-[var(--border)] py-2.5 text-sm text-[var(--text-secondary)]"
            >
              Hủy
            </button>
          )}
          <button
            onClick={addCard}
            disabled={!prompt.trim() || !answer.trim()}
            className="font-800 flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--mint)] py-2.5 text-sm text-white transition-all disabled:opacity-40"
          >
            <Plus size={15} />
            {editingId ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>

      {/* Card list */}
      {cards.length > 0 && (
        <div className="space-y-2">
          <p className="font-700 text-sm text-[var(--text-secondary)]">{cards.length} câu hỏi</p>
          <AnimatePresence>
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2.5"
              >
                <span className="font-700 w-5 shrink-0 text-xs text-[var(--text-secondary)]">
                  {idx + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-700 kana-text truncate text-sm text-[var(--text-primary)]">
                    {card.prompt}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{card.answer}</p>
                </div>
                <button
                  onClick={() => startEdit(card)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--border)] transition-colors hover:bg-[var(--coral-light)]"
                >
                  <PenLine size={12} />
                </button>
                <button
                  onClick={() => removeCard(card.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--border)] transition-colors hover:bg-red-100"
                >
                  <X size={12} className="text-red-400" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Save */}
      <button
        onClick={save}
        className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-4 text-white transition-all hover:scale-[1.01] active:scale-[0.98]"
      >
        <Check size={18} /> Lưu bộ quiz ({cards.length} câu)
      </button>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  desc,
  onAction,
  actionLabel,
}: {
  emoji: string;
  title: string;
  desc: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className="space-y-3 py-16 text-center">
      <p className="text-5xl">{emoji}</p>
      <p className="font-800 text-[var(--text-primary)]">{title}</p>
      <p className="font-600 text-sm text-[var(--text-secondary)]">{desc}</p>
      <button
        onClick={onAction}
        className="font-700 mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[var(--coral)] px-5 py-2.5 text-white transition-all hover:scale-[1.02]"
      >
        <Plus size={16} /> {actionLabel}
      </button>
    </div>
  );
}
