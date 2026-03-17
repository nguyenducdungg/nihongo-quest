"use client";

/**
 * CustomContentEditor — Teacher creates custom quiz questions or flashcards
 * Quiz: teacher manually enters prompt + 4 choices + marks correct answer
 * Flashcard: teacher enters front/back/reading
 */

import { Plus, Trash2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
export type CustomQItem = {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};
export type CustomFCard = { id: string; front: string; back: string; reading: string };

let _id = 0;
const uid = () => `custom_${Date.now()}_${++_id}`;

const emptyQuestion = (): CustomQItem => ({
  id: uid(),
  prompt: "",
  choices: ["", "", "", ""],
  correctIndex: 0,
});

// ── Quiz Editor ──────────────────────────────────────────────────

interface QuizEditorProps {
  items: CustomQItem[];
  onChange: (items: CustomQItem[]) => void;
}

const CHOICE_LABELS = ["A", "B", "C", "D"];

export function CustomQuizEditor({ items, onChange }: QuizEditorProps) {
  const add = () => onChange([...items, emptyQuestion()]);

  const updatePrompt = (id: string, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, prompt: value } : i)));

  const updateChoice = (id: string, idx: number, value: string) =>
    onChange(
      items.map((i) => {
        if (i.id !== id) return i;
        const choices = [...i.choices] as [string, string, string, string];
        choices[idx] = value;
        return { ...i, choices };
      })
    );

  const setCorrect = (id: string, idx: 0 | 1 | 2 | 3) =>
    onChange(items.map((i) => (i.id === id ? { ...i, correctIndex: idx } : i)));

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const isValid = (item: CustomQItem) => item.prompt.trim() && item.choices.every((c) => c.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-800 text-xs text-[var(--text-primary)]">
          Danh sách câu hỏi ({items.length})
        </p>
        <p className="font-600 text-[10px] text-[var(--text-secondary)]">
          Nhấn ● để đánh dấu đáp án đúng
        </p>
      </div>

      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const valid = isValid(item);
          return (
            <div
              key={item.id}
              className={`space-y-2.5 rounded-2xl border-2 p-3 ${valid ? "border-[var(--border)] bg-[var(--cream)]" : "border-orange-200 bg-orange-50/40"}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-900 text-xs text-[var(--text-secondary)]">Câu {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="p-0.5 text-gray-300 transition-colors hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Prompt */}
              <div>
                <label className="font-700 mb-0.5 block text-[10px] text-[var(--text-secondary)]">
                  Câu hỏi / từ cần nhận biết
                </label>
                <input
                  value={item.prompt}
                  onChange={(e) => updatePrompt(item.id, e.target.value)}
                  placeholder="VD: あ  hoặc  Nghĩa của 'ありがとう' là?"
                  className="font-600 kana-text w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-1.5">
                <label className="font-700 block text-[10px] text-[var(--text-secondary)]">
                  4 lựa chọn — nhấn nút tròn để chọn đáp án đúng
                </label>
                {item.choices.map((choice, ci) => {
                  const isCorrect = item.correctIndex === ci;
                  return (
                    <div key={ci} className="flex items-center gap-2">
                      {/* Correct radio */}
                      <button
                        type="button"
                        onClick={() => setCorrect(item.id, ci as 0 | 1 | 2 | 3)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isCorrect
                            ? "border-green-600 bg-green-500"
                            : "border-gray-300 bg-white hover:border-green-400"
                        }`}
                        title="Chọn làm đáp án đúng"
                      >
                        {isCorrect && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </button>

                      {/* Label */}
                      <span
                        className={`font-900 w-5 shrink-0 text-xs ${isCorrect ? "text-green-600" : "text-[var(--text-secondary)]"}`}
                      >
                        {CHOICE_LABELS[ci]}
                      </span>

                      {/* Input */}
                      <input
                        value={choice}
                        onChange={(e) => updateChoice(item.id, ci, e.target.value)}
                        placeholder={`Đáp án ${CHOICE_LABELS[ci]}`}
                        className={`font-600 flex-1 rounded-lg border px-2.5 py-1.5 text-sm transition-colors focus:outline-none ${
                          isCorrect
                            ? "border-green-400 bg-green-50 focus:border-green-500"
                            : "border-[var(--border)] bg-white focus:border-[var(--coral)]"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={add}
        className="font-700 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--coral)]/40 py-2 text-sm text-[var(--coral)] transition-colors hover:bg-[var(--coral-light)]"
      >
        <Plus size={14} /> Thêm câu hỏi
      </button>

      {items.length > 0 && items.some((i) => !isValid(i)) && (
        <p className="font-700 text-[10px] text-orange-500">
          ⚠ Vui lòng điền đầy đủ câu hỏi và 4 lựa chọn cho tất cả các câu
        </p>
      )}
    </div>
  );
}

// ── Flashcard Editor ─────────────────────────────────────────────

interface FlashcardEditorProps {
  cards: CustomFCard[];
  onChange: (cards: CustomFCard[]) => void;
}

export function CustomFlashcardEditor({ cards, onChange }: FlashcardEditorProps) {
  const add = () => onChange([...cards, { id: uid(), front: "", back: "", reading: "" }]);

  const update = (id: string, field: keyof CustomFCard, value: string) =>
    onChange(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const remove = (id: string) => onChange(cards.filter((c) => c.id !== id));

  return (
    <div className="space-y-2">
      <p className="font-800 text-xs text-[var(--text-primary)]">
        Danh sách flashcard ({cards.length})
      </p>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {cards.map((card, idx) => (
          <div key={card.id} className="flex items-start gap-2 rounded-xl bg-[var(--cream)] p-2">
            <span className="font-900 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs text-[var(--text-secondary)]">
              {idx + 1}
            </span>
            <div className="flex-1 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="font-700 mb-0.5 block text-[10px] text-[var(--text-secondary)]">
                    Mặt trước (tiếng Nhật)
                  </label>
                  <input
                    value={card.front}
                    onChange={(e) => update(card.id, "front", e.target.value)}
                    placeholder="VD: ありがとう"
                    className="font-600 kana-text w-full rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-700 mb-0.5 block text-[10px] text-[var(--text-secondary)]">
                    Mặt sau (nghĩa)
                  </label>
                  <input
                    value={card.back}
                    onChange={(e) => update(card.id, "back", e.target.value)}
                    placeholder="VD: Cảm ơn"
                    className="font-600 w-full rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-700 mb-0.5 block text-[10px] text-[var(--text-secondary)]">
                  Phiên âm (tùy chọn)
                </label>
                <input
                  value={card.reading}
                  onChange={(e) => update(card.id, "reading", e.target.value)}
                  placeholder="VD: arigatou"
                  className="font-600 w-full rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(card.id)}
              className="mt-1 shrink-0 p-1 text-gray-300 transition-colors hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="font-700 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--mint-dark)]/40 py-2 text-sm text-[var(--mint-dark)] transition-colors hover:bg-[var(--mint)]/20"
      >
        <Plus size={14} /> Thêm flashcard
      </button>
    </div>
  );
}
