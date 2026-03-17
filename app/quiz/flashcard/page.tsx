"use client";

/**
 * Custom Flashcard page — Create, manage and study user-defined flashcard decks
 * Deck list → Create/Edit deck → Study mode with flip-card + progress
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  Trash2,
  BookOpen,
  PenLine,
  X,
  Check,
  RotateCcw,
  ChevronRight as Next,
} from "lucide-react";
import { getFlashcardDecks, saveFlashcardDeck, deleteFlashcardDeck } from "@/app/actions/decks";
import { generateId } from "@/lib/customData";
import { CustomFlashcardDeck, CustomFlashcard } from "@/types";

type Screen = "list" | "edit" | "study";

export default function CustomFlashcardPage() {
  const [screen, setScreen] = useState<Screen>("list");
  const [decks, setDecks] = useState<CustomFlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<CustomFlashcardDeck | null>(null);

  useEffect(() => {
    refreshDecks();
  }, []);

  const refreshDecks = () =>
    getFlashcardDecks().then((d) => setDecks(d as unknown as CustomFlashcardDeck[]));

  const newDeck = () => {
    setActiveDeck({
      id: generateId(),
      name: "Bộ flashcard mới",
      cards: [],
      createdAt: new Date().toISOString(),
    });
    setScreen("edit");
  };

  const editDeck = (deck: CustomFlashcardDeck) => {
    setActiveDeck({ ...deck });
    setScreen("edit");
  };
  const studyDeck = (deck: CustomFlashcardDeck) => {
    setActiveDeck(deck);
    setScreen("study");
  };
  const removeDeck = (id: string) => deleteFlashcardDeck(id).then(() => refreshDecks());

  if (screen === "study" && activeDeck) {
    return <StudyMode deck={activeDeck} onBack={() => setScreen("list")} />;
  }

  if (screen === "edit" && activeDeck) {
    return (
      <DeckEditor
        deck={activeDeck}
        onSave={(d) =>
          saveFlashcardDeck(d.id, d.name, d.cards).then(() => {
            refreshDecks();
            setScreen("list");
          })
        }
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
          <h1 className="font-800 text-xl text-[var(--text-primary)]">Flashcard tự tạo</h1>
        </div>
        <button
          onClick={newDeck}
          className="font-700 flex items-center gap-1.5 rounded-xl bg-[var(--yellow-dark)] px-3 py-2 text-sm text-[var(--text-primary)] transition-all hover:scale-[1.02] active:scale-[0.97]"
        >
          <Plus size={16} /> Tạo mới
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="space-y-3 py-16 text-center">
          <p className="text-5xl">🃏</p>
          <p className="font-800 text-[var(--text-primary)]">Chưa có bộ thẻ nào</p>
          <p className="font-600 text-sm text-[var(--text-secondary)]">
            Tạo bộ flashcard đầu tiên của bạn!
          </p>
          <button
            onClick={newDeck}
            className="font-700 mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[var(--yellow-dark)] px-5 py-2.5 text-[var(--text-primary)] transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Tạo ngay
          </button>
        </div>
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
                  {deck.cards.length} thẻ
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
                  onClick={() => studyDeck(deck)}
                  disabled={deck.cards.length === 0}
                  className="font-700 flex items-center gap-1.5 rounded-xl bg-[var(--yellow-dark)] px-3 py-2 text-xs text-[var(--text-primary)] transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40"
                >
                  <BookOpen size={13} /> Học
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

// ===== Study Mode =====

function StudyMode({ deck, onBack }: { deck: CustomFlashcardDeck; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const card = deck.cards[index];
  const progress = Math.round((known.size / deck.cards.length) * 100);

  const go = (dir: number, markKnown?: boolean) => {
    if (markKnown) setKnown((prev) => new Set([...prev, index]));
    const next = index + dir;
    if (next >= deck.cards.length) {
      setFinished(true);
      return;
    }
    if (next < 0) return;
    setDirection(dir);
    setFlipped(false);
    setIndex(next);
  };

  if (finished) {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="font-800 text-xl text-[var(--text-primary)]">{deck.name}</h1>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4 rounded-3xl border-2 border-[var(--border)] bg-white p-8 text-center"
        >
          <p className="text-6xl">🎉</p>
          <h2 className="font-900 text-xl text-[var(--text-primary)]">Xong rồi!</h2>
          <p className="font-600 text-[var(--text-secondary)]">
            Bạn đã nhớ{" "}
            <strong className="text-[var(--mint-dark)]">
              {known.size}/{deck.cards.length}
            </strong>{" "}
            thẻ
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setIndex(0);
                setFlipped(false);
                setKnown(new Set());
                setFinished(false);
              }}
              className="font-700 flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-[var(--border)] py-3 text-sm"
            >
              <RotateCcw size={15} /> Học lại
            </button>
            <button
              onClick={onBack}
              className="font-800 flex-1 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3 text-sm text-white"
            >
              Về danh sách
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-800 flex-1 truncate text-xl text-[var(--text-primary)]">{deck.name}</h1>
        <span className="font-700 shrink-0 text-sm text-[var(--text-secondary)]">
          {index + 1}/{deck.cards.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full bg-[var(--yellow-dark)]"
          animate={{ width: `${Math.max(progress, 3)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Flip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: direction * 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -direction * 60, opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{ perspective: "1000px" }}
          onClick={() => setFlipped((f) => !f)}
          className="cursor-pointer"
        >
          <motion.div
            className="relative w-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 180 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className="flex min-h-52 w-full flex-col items-center justify-center rounded-3xl border-2 border-[var(--border)] bg-white p-6 shadow-md"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="font-700 kana-text text-center text-5xl text-[var(--text-primary)]">
                {card.front}
              </p>
              {card.reading && (
                <p className="font-600 mt-2 text-sm text-[var(--text-secondary)]">{card.reading}</p>
              )}
              <p className="mt-6 text-xs text-gray-400">Nhấn để lật thẻ</p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 flex min-h-52 w-full flex-col items-center justify-center rounded-3xl border-2 border-[var(--yellow-dark)] bg-[var(--yellow)] p-6"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="font-900 text-center text-3xl text-[var(--text-primary)]">
                {card.back}
              </p>
              {card.reading && (
                <p className="kana-text mt-2 text-sm text-[var(--text-secondary)]">
                  {card.front} ({card.reading})
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="font-700 flex items-center justify-center gap-1 rounded-2xl border-2 border-[var(--border)] py-3 text-sm text-[var(--text-secondary)] disabled:opacity-30"
        >
          <ChevronLeft size={15} /> Trước
        </button>
        <button
          onClick={() => go(1, true)}
          className="font-800 flex items-center justify-center gap-1 rounded-2xl border-2 border-[var(--mint-dark)] bg-[var(--mint)] py-3 text-sm text-white"
        >
          <Check size={15} /> Nhớ rồi
        </button>
        <button
          onClick={() => go(1, false)}
          className="font-700 flex items-center justify-center gap-1 rounded-2xl border-2 border-[var(--coral)] py-3 text-sm text-[var(--coral)]"
        >
          Ôn thêm <Next size={15} />
        </button>
      </div>

      <p className="font-600 text-center text-xs text-[var(--text-secondary)]">
        Đã nhớ: {known.size}/{deck.cards.length} thẻ
      </p>
    </div>
  );
}

// ===== Deck Editor =====

function DeckEditor({
  deck,
  onSave,
  onCancel,
}: {
  deck: CustomFlashcardDeck;
  onSave: (d: CustomFlashcardDeck) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(deck.name);
  const [cards, setCards] = useState<CustomFlashcard[]>(deck.cards);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [reading, setReading] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCard = () => {
    if (!front.trim() || !back.trim()) return;
    const newCard: CustomFlashcard = {
      id: generateId(),
      front: front.trim(),
      back: back.trim(),
      reading: reading.trim() || undefined,
    };
    if (editingId) {
      setCards((prev) => prev.map((c) => (c.id === editingId ? { ...newCard, id: editingId } : c)));
      setEditingId(null);
    } else {
      setCards((prev) => [...prev, newCard]);
    }
    setFront("");
    setBack("");
    setReading("");
  };

  const startEdit = (card: CustomFlashcard) => {
    setEditingId(card.id);
    setFront(card.front);
    setBack(card.back);
    setReading(card.reading ?? "");
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Chỉnh sửa flashcard</h1>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên bộ thẻ..."
        className="font-700 w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-[var(--yellow-dark)] focus:outline-none"
      />

      <div className="space-y-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="font-800 text-sm text-[var(--text-primary)]">
          {editingId ? "Sửa thẻ" : "Thêm thẻ mới"}
        </p>
        <input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Mặt trước (tiếng Nhật / từ khóa)..."
          className="font-600 kana-text w-full rounded-xl border-2 border-[var(--border)] px-3 py-2.5 text-sm transition-colors focus:border-[var(--yellow-dark)] focus:outline-none"
        />
        <input
          value={reading}
          onChange={(e) => setReading(e.target.value)}
          placeholder="Phiên âm (tùy chọn)..."
          className="font-600 w-full rounded-xl border-2 border-[var(--border)] px-3 py-2.5 text-sm transition-colors focus:border-[var(--yellow-dark)] focus:outline-none"
        />
        <input
          value={back}
          onChange={(e) => setBack(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          placeholder="Mặt sau (nghĩa / giải thích)..."
          className="font-600 w-full rounded-xl border-2 border-[var(--border)] px-3 py-2.5 text-sm transition-colors focus:border-[var(--yellow-dark)] focus:outline-none"
        />
        <div className="flex gap-2">
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFront("");
                setBack("");
                setReading("");
              }}
              className="font-700 flex-1 rounded-xl border-2 border-[var(--border)] py-2.5 text-sm text-[var(--text-secondary)]"
            >
              Hủy
            </button>
          )}
          <button
            onClick={addCard}
            disabled={!front.trim() || !back.trim()}
            className="font-800 flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--yellow-dark)] py-2.5 text-sm text-[var(--text-primary)] transition-all disabled:opacity-40"
          >
            <Plus size={15} /> {editingId ? "Cập nhật" : "Thêm thẻ"}
          </button>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="space-y-2">
          <p className="font-700 text-sm text-[var(--text-secondary)]">{cards.length} thẻ</p>
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
                  <p className="font-700 kana-text truncate text-sm">{card.front}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{card.back}</p>
                </div>
                <button
                  onClick={() => startEdit(card)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--border)] hover:bg-[var(--coral-light)]"
                >
                  <PenLine size={12} />
                </button>
                <button
                  onClick={() => setCards((prev) => prev.filter((c) => c.id !== card.id))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--border)] hover:bg-red-100"
                >
                  <X size={12} className="text-red-400" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={() => onSave({ ...deck, name: name.trim() || "Bộ flashcard", cards })}
        className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--yellow-dark)] py-4 text-[var(--text-primary)] transition-all hover:scale-[1.01] active:scale-[0.98]"
      >
        <Check size={18} /> Lưu bộ thẻ ({cards.length} thẻ)
      </button>
    </div>
  );
}
