"use client";

/**
 * Custom Quiz page
 * "Của tôi" tab: personal decks (create / edit / delete / share toggle)
 * "Thư viện" tab: shared decks by teachers & others (play only)
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Play,
  PenLine,
  X,
  Check,
  Globe,
  Lock,
  Library,
  User,
} from "lucide-react";
import {
  getQuizDecks,
  saveQuizDeck,
  deleteQuizDeck,
  toggleShareQuizDeck,
  getSharedQuizDecks,
} from "@/app/actions/decks";
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
type Tab = "mine" | "library";

type MyDeck = Awaited<ReturnType<typeof getQuizDecks>>[number];
type SharedDeck = Awaited<ReturnType<typeof getSharedQuizDecks>>[number];

function toClientDeck(d: MyDeck): CustomQuizDeck {
  return {
    id: d.id,
    name: d.name,
    cards: d.cards as unknown as CustomQuizCard[],
    isShared: d.isShared,
    createdAt: d.createdAt.toISOString(),
  };
}

function sharedToClientDeck(d: SharedDeck): CustomQuizDeck {
  return {
    id: d.id,
    name: d.name,
    cards: d.cards as unknown as CustomQuizCard[],
    isShared: true,
    createdAt: d.createdAt.toISOString(),
    ownerName: d.owner?.displayName ?? "Ẩn danh",
  };
}

export default function CustomQuizPage() {
  const [screen, setScreen] = useState<Screen>("list");
  const [tab, setTab] = useState<Tab>("mine");
  const [myDecks, setMyDecks] = useState<CustomQuizDeck[]>([]);
  const [sharedDecks, setSharedDecks] = useState<CustomQuizDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<CustomQuizDeck | null>(null);
  const [playQuestions, setPlayQuestions] = useState<QuizQuestion[]>([]);
  const [toggling, setToggling] = useState<string | null>(null);

  const refreshDecks = useCallback(() => {
    getQuizDecks().then((d) => setMyDecks(d.map(toClientDeck)));
    getSharedQuizDecks().then((d) => setSharedDecks(d.map(sharedToClientDeck)));
  }, []);

  useEffect(() => {
    refreshDecks();
  }, [refreshDecks]);

  const newDeck = () => {
    setActiveDeck({
      id: generateId(),
      name: "Bộ quiz mới",
      cards: [],
      createdAt: new Date().toISOString(),
    });
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

  const handleToggleShare = async (deck: CustomQuizDeck) => {
    setToggling(deck.id);
    await toggleShareQuizDeck(deck.id);
    refreshDecks();
    setToggling(null);
  };

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
          {activeDeck.ownerName && (
            <span className="font-600 shrink-0 text-xs text-[var(--text-secondary)]">
              by {activeDeck.ownerName}
            </span>
          )}
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
          // Pass null for new decks (client-generated id) — server will create fresh
          saveQuizDeck(updated.id, updated.name, updated.cards).then(() => {
            refreshDecks();
            setScreen("list");
          });
        }}
        onCancel={() => setScreen("list")}
      />
    );
  }

  const decks = tab === "mine" ? myDecks : sharedDecks;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-4 pb-28">
      {/* Header */}
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
        {tab === "mine" && (
          <button
            onClick={newDeck}
            className="font-700 flex items-center gap-1.5 rounded-xl bg-[var(--mint)] px-3 py-2 text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.97]"
          >
            <Plus size={16} /> Tạo mới
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-[var(--cream)] p-1">
        <button
          onClick={() => setTab("mine")}
          className={`font-700 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-all ${tab === "mine" ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"}`}
        >
          <User size={14} /> Của tôi ({myDecks.length})
        </button>
        <button
          onClick={() => setTab("library")}
          className={`font-700 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-all ${tab === "library" ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"}`}
        >
          <Library size={14} /> Thư viện ({sharedDecks.length})
        </button>
      </div>

      {/* Deck list */}
      {decks.length === 0 ? (
        <div className="space-y-3 py-16 text-center">
          <p className="text-5xl">{tab === "mine" ? "📝" : "📚"}</p>
          <p className="font-800 text-[var(--text-primary)]">
            {tab === "mine" ? "Chưa có bộ quiz nào" : "Chưa có bộ quiz được chia sẻ"}
          </p>
          <p className="font-600 text-sm text-[var(--text-secondary)]">
            {tab === "mine"
              ? 'Nhấn "Tạo mới" để bắt đầu!'
              : "Khi giáo viên chia sẻ bộ quiz, chúng sẽ xuất hiện ở đây."}
          </p>
          {tab === "mine" && (
            <button
              onClick={newDeck}
              className="font-700 mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[var(--coral)] px-5 py-2.5 text-white transition-all hover:scale-[1.02]"
            >
              <Plus size={16} /> Tạo ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {decks.map((deck) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-800 truncate text-[var(--text-primary)]">{deck.name}</p>
                    <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">
                      {deck.cards.length} câu hỏi
                      {deck.ownerName && (
                        <span className="ml-2 text-[var(--coral)]">· by {deck.ownerName}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {/* Share toggle — only for own decks */}
                    {tab === "mine" && (
                      <button
                        onClick={() => handleToggleShare(deck)}
                        disabled={toggling === deck.id}
                        title={
                          deck.isShared ? "Đang chia sẻ — nhấn để thu hồi" : "Chia sẻ với mọi người"
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                          deck.isShared
                            ? "bg-green-100 text-green-600"
                            : "bg-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--mint-light)] hover:text-[var(--mint-dark)]"
                        }`}
                      >
                        {deck.isShared ? <Globe size={14} /> : <Lock size={14} />}
                      </button>
                    )}

                    {tab === "mine" && (
                      <button
                        onClick={() => editDeck(deck)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--border)] transition-colors hover:bg-[var(--coral-light)]"
                      >
                        <PenLine size={14} className="text-[var(--text-secondary)]" />
                      </button>
                    )}

                    <button
                      onClick={() => playDeck(deck)}
                      disabled={deck.cards.length < 2}
                      className="font-700 flex items-center gap-1.5 rounded-xl bg-[var(--coral)] px-3 py-2 text-xs text-white transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40"
                    >
                      <Play size={13} /> Chơi
                    </button>

                    {tab === "mine" && (
                      <button
                        onClick={() => removeDeck(deck.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--border)] transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Shared badge */}
                {deck.isShared && tab === "mine" && (
                  <div className="font-700 mt-2 flex items-center gap-1 text-[10px] text-green-600">
                    <Globe size={10} /> Đang chia sẻ với tất cả mọi người
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
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

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-4 pb-28">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Chỉnh sửa quiz</h1>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên bộ quiz..."
        className="font-700 w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-[var(--coral)] focus:outline-none"
      />

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
            <Plus size={15} /> {editingId ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>

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

      <button
        onClick={() => onSave({ ...deck, name: name.trim() || "Bộ quiz", cards })}
        className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-4 text-white transition-all hover:scale-[1.01] active:scale-[0.98]"
      >
        <Check size={18} /> Lưu bộ quiz ({cards.length} câu)
      </button>
    </div>
  );
}
