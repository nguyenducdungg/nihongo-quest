"use client";

/**
 * Session Detail (Teacher view) — manage assignments with content picker, view + grade submissions
 */

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSessionDetail, updateSessionStatus } from "@/app/actions/session";
import {
  createAssignment,
  deleteAssignment,
  getSubmissionsForAssignment,
  AssignmentTypeValue,
} from "@/app/actions/assignment";
import { gradeSubmission } from "@/app/actions/submission";
import { getProfile } from "@/app/actions/auth";
import { hiraganaData } from "@/data/hiragana";
import { katakanaData } from "@/data/katakana";
import { vocabularyData } from "@/data/vocabulary";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  Star,
  CheckCircle2,
  Play,
  Square,
  FileText,
  Wand2,
  PenLine,
} from "lucide-react";
import {
  CustomQuizEditor,
  CustomFlashcardEditor,
  type CustomQItem,
  type CustomFCard,
} from "@/components/assignment/CustomContentEditor";

type SessionDetail = Awaited<ReturnType<typeof getSessionDetail>>;
type Submission = Awaited<ReturnType<typeof getSubmissionsForAssignment>>[number];
type AnswerRecord = { questionId: string; prompt: string; chosen: string; correct: boolean };

const TYPE_LABELS: Record<AssignmentTypeValue, { label: string; emoji: string }> = {
  QUIZ: { label: "Trắc nghiệm", emoji: "📝" },
  FLASHCARD: { label: "Flashcard", emoji: "🃏" },
  KANA_PRACTICE: { label: "Luyện kana", emoji: "🔤" },
  FREE_WRITE: { label: "Viết tự do", emoji: "✏️" },
};

// ── Data maps ──────────────────────────────────────────────────
const KANA_GROUPS: { id: string; label: string; type: "hiragana" | "katakana" }[] = [
  { id: "vowels", label: "Hiragana — Nguyên âm (a i u e o)", type: "hiragana" },
  { id: "k", label: "Hiragana — Hàng K", type: "hiragana" },
  { id: "s", label: "Hiragana — Hàng S", type: "hiragana" },
  { id: "t", label: "Hiragana — Hàng T", type: "hiragana" },
  { id: "n", label: "Hiragana — Hàng N", type: "hiragana" },
  { id: "h", label: "Hiragana — Hàng H", type: "hiragana" },
  { id: "m", label: "Hiragana — Hàng M", type: "hiragana" },
  { id: "y", label: "Hiragana — Hàng Y", type: "hiragana" },
  { id: "r", label: "Hiragana — Hàng R", type: "hiragana" },
  { id: "w", label: "Hiragana — Hàng W", type: "hiragana" },
  { id: "dakuten-g", label: "Hiragana — Âm đục G", type: "hiragana" },
  { id: "dakuten-z", label: "Hiragana — Âm đục Z", type: "hiragana" },
  { id: "dakuten-d", label: "Hiragana — Âm đục D", type: "hiragana" },
  { id: "dakuten-b", label: "Hiragana — Âm đục B", type: "hiragana" },
  { id: "handakuten-p", label: "Hiragana — Âm nửa đục P", type: "hiragana" },
  { id: "katakana-vowels", label: "Katakana — Nguyên âm", type: "katakana" },
  { id: "katakana-k", label: "Katakana — Hàng K", type: "katakana" },
  { id: "katakana-s", label: "Katakana — Hàng S", type: "katakana" },
  { id: "katakana-t", label: "Katakana — Hàng T", type: "katakana" },
  { id: "katakana-n", label: "Katakana — Hàng N", type: "katakana" },
];

const VOCAB_TOPICS: { id: string; label: string }[] = [
  { id: "greetings", label: "Chào hỏi 👋" },
  { id: "numbers", label: "Số đếm 🔢" },
  { id: "colors", label: "Màu sắc 🎨" },
  { id: "family", label: "Gia đình 👨‍👩‍👧" },
  { id: "food", label: "Đồ ăn 🍱" },
  { id: "adjectives", label: "Tính từ 📖" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildContentRef(type: AssignmentTypeValue, opts: ContentOptions): object {
  if (type === "QUIZ" || type === "KANA_PRACTICE") {
    // Collect characters from selected kana groups
    let chars = hiraganaData.filter((c) => opts.kanaGroups.includes(c.group));
    const katakanaGroups = opts.kanaGroups
      .filter((g) => g.startsWith("katakana-"))
      .map((g) => g.replace("katakana-", ""));
    chars = [...chars, ...katakanaData.filter((c) => katakanaGroups.includes(c.group))];

    // Also include vocab if selected
    const vocabItems = vocabularyData.filter((v) => opts.vocabTopics.includes(v.topic));

    const kanaQs = shuffle(chars)
      .slice(0, opts.questionCount)
      .map((c) => {
        const wrong = shuffle(chars.filter((x) => x !== c))
          .slice(0, 3)
          .map((x) => x.romaji);
        return {
          id: c.kana,
          prompt: c.kana,
          answer: c.romaji,
          choices: shuffle([c.romaji, ...wrong]),
        };
      });

    const vocabQs = shuffle(vocabItems)
      .slice(0, Math.min(opts.questionCount, vocabItems.length))
      .map((v) => {
        const wrong = shuffle(vocabItems.filter((x) => x !== v))
          .slice(0, 3)
          .map((x) => x.meaning);
        return {
          id: v.japanese,
          prompt: v.japanese,
          answer: v.meaning,
          choices: shuffle([v.meaning, ...wrong]),
        };
      });

    const questions = shuffle([...kanaQs, ...vocabQs]).slice(0, opts.questionCount);
    return { questions, sourceGroups: opts.kanaGroups, sourceTopics: opts.vocabTopics };
  }

  if (type === "FLASHCARD") {
    const kanaCards = hiraganaData
      .filter((c) => opts.kanaGroups.includes(c.group))
      .map((c) => ({ id: c.kana, front: c.kana, back: c.romaji }));

    const vocabCards = vocabularyData
      .filter((v) => opts.vocabTopics.includes(v.topic))
      .map((v) => ({ id: v.japanese, front: v.japanese, back: v.meaning, reading: v.reading }));

    const cards = shuffle([...kanaCards, ...vocabCards]).slice(0, opts.questionCount);
    return { cards, sourceGroups: opts.kanaGroups, sourceTopics: opts.vocabTopics };
  }

  if (type === "FREE_WRITE") {
    return { prompt: opts.freeWritePrompt || "Viết câu trả lời của bạn." };
  }

  return {};
}

type ContentOptions = {
  kanaGroups: string[];
  vocabTopics: string[];
  questionCount: number;
  freeWritePrompt: string;
};

function buildCustomContentRef(
  type: AssignmentTypeValue,
  quizItems: CustomQItem[],
  fCards: CustomFCard[]
): object {
  if (type === "QUIZ" || type === "KANA_PRACTICE") {
    const questions = quizItems.map((item) => ({
      id: item.id,
      prompt: item.prompt,
      answer: item.choices[item.correctIndex],
      choices: [...item.choices], // teacher-defined order preserved
    }));
    return { questions, isCustom: true };
  }
  if (type === "FLASHCARD") {
    const cards = fCards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      reading: c.reading || undefined,
    }));
    return { cards, isCustom: true };
  }
  return {};
}

// ── Main Page ────────────────────────────────────────────────────
export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail>(null);
  const [myId, setMyId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Form state
  const [aType, setAType] = useState<AssignmentTypeValue>("QUIZ");
  const [aTitle, setATitle] = useState("");
  const [aDesc, setADesc] = useState("");
  const [aDueAt, setADueAt] = useState("");
  const [aMaxScore, setAMaxScore] = useState(100);
  const [contentMode, setContentMode] = useState<"preset" | "custom">("preset");
  const [customQuizItems, setCustomQuizItems] = useState<CustomQItem[]>([]);
  const [customFCards, setCustomFCards] = useState<CustomFCard[]>([]);
  const [contentOpts, setContentOpts] = useState<ContentOptions>({
    kanaGroups: [],
    vocabTopics: [],
    questionCount: 10,
    freeWritePrompt: "",
  });

  const refresh = useCallback(() => {
    getSessionDetail(sessionId).then(setSession);
  }, [sessionId]);

  useEffect(() => {
    refresh();
    getProfile().then((p) => setMyId(p?.id ?? ""));
  }, [refresh]);

  const isTeacher = session?.classroom.teacherId === myId;

  const toggleKanaGroup = (g: string) =>
    setContentOpts((p) => ({
      ...p,
      kanaGroups: p.kanaGroups.includes(g)
        ? p.kanaGroups.filter((x) => x !== g)
        : [...p.kanaGroups, g],
    }));

  const toggleVocabTopic = (t: string) =>
    setContentOpts((p) => ({
      ...p,
      vocabTopics: p.vocabTopics.includes(t)
        ? p.vocabTopics.filter((x) => x !== t)
        : [...p.vocabTopics, t],
    }));

  const customQuizValid =
    customQuizItems.length >= 1 &&
    customQuizItems.every((i) => i.prompt.trim() && i.choices.every((c) => c.trim()));

  const hasContent =
    aType === "FREE_WRITE"
      ? contentOpts.freeWritePrompt.trim().length > 0
      : contentMode === "custom"
        ? aType === "FLASHCARD"
          ? customFCards.length >= 1
          : customQuizValid
        : contentOpts.kanaGroups.length > 0 || contentOpts.vocabTopics.length > 0;

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim() || !hasContent) return;
    setCreating(true);

    let contentRef: object;
    if (contentMode === "custom" && aType !== "FREE_WRITE") {
      contentRef = buildCustomContentRef(aType, customQuizItems, customFCards);
    } else {
      contentRef = buildContentRef(aType, contentOpts);
    }

    await createAssignment({
      sessionId,
      type: aType,
      title: aTitle.trim(),
      description: aDesc.trim() || undefined,
      contentRef,
      dueAt: aDueAt || undefined,
      maxScore: aMaxScore,
    });
    setATitle("");
    setADesc("");
    setADueAt("");
    setShowForm(false);
    setContentOpts({ kanaGroups: [], vocabTopics: [], questionCount: 10, freeWritePrompt: "" });
    setCustomQuizItems([]);
    setCustomFCards([]);
    setContentMode("preset");
    refresh();
    setCreating(false);
  };

  const handleStatusChange = async (status: "DRAFT" | "ACTIVE" | "COMPLETED") => {
    await updateSessionStatus(sessionId, status);
    refresh();
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Xóa bài tập này?")) return;
    await deleteAssignment(assignmentId);
    refresh();
  };

  const loadSubmissions = async (assignmentId: string) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
      return;
    }
    setExpandedAssignment(assignmentId);
    if (!submissions[assignmentId]) {
      const data = await getSubmissionsForAssignment(assignmentId);
      setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
    }
  };

  const handleGrade = async (
    submissionId: string,
    score: number,
    note: string,
    assignmentId: string
  ) => {
    await gradeSubmission(submissionId, score, note || undefined);
    const data = await getSubmissionsForAssignment(assignmentId);
    setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
  };

  if (!session) return <PageLoader />;

  const isDraft = session.status === "DRAFT";
  const isActive = session.status === "ACTIVE";
  const isCompleted = session.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 pt-4 pb-28">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/classroom/${id}`)}
          className="font-600 mb-3 flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--coral)]"
        >
          <ArrowLeft size={16} /> {session.classroom.name}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-900 text-xl text-[var(--text-primary)]">{session.title}</h1>
            {session.description && (
              <p className="font-600 mt-0.5 text-sm text-[var(--text-secondary)]">
                {session.description}
              </p>
            )}
            <p className="font-600 mt-1 text-xs text-[var(--text-secondary)]">
              {session.assignments.length} bài tập
            </p>
          </div>
          {/* Status badge */}
          <span
            className={`font-800 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
              isDraft
                ? "bg-gray-100 text-gray-500"
                : isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {isDraft ? (
              <>
                <FileText size={11} /> Nháp
              </>
            ) : isActive ? (
              <>
                <Play size={11} /> Đang mở
              </>
            ) : (
              <>
                <Square size={11} /> Đã kết thúc
              </>
            )}
          </span>
        </div>
      </div>

      {/* Status control — teacher only */}
      {isTeacher && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 ${
            isDraft
              ? "border-orange-200 bg-orange-50"
              : isActive
                ? "border-green-200 bg-green-50"
                : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="min-w-0">
            {isDraft && (
              <p className="font-800 text-sm text-orange-700">Học sinh chưa thể thấy bài tập</p>
            )}
            {isActive && (
              <p className="font-800 text-sm text-green-700">Học sinh đang có thể làm bài</p>
            )}
            {isCompleted && <p className="font-800 text-sm text-blue-700">Buổi học đã kết thúc</p>}
            <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">
              {isDraft && 'Nhấn "Mở bài tập" để học sinh thấy và làm bài.'}
              {isActive && 'Nhấn "Kết thúc" khi muốn đóng buổi học.'}
              {isCompleted && "Học sinh không thể nộp thêm bài."}
            </p>
          </div>
          {isDraft && (
            <button
              onClick={() => handleStatusChange("ACTIVE")}
              className="font-800 flex shrink-0 items-center gap-1.5 rounded-xl border border-green-600 bg-green-500 px-4 py-2 text-sm whitespace-nowrap text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={14} /> Mở bài tập
            </button>
          )}
          {isActive && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="font-800 flex shrink-0 items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-500 px-4 py-2 text-sm whitespace-nowrap text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Square size={14} /> Kết thúc
            </button>
          )}
        </div>
      )}

      {/* Add assignment */}
      {isTeacher && (
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-700 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--coral)]/40 py-3 text-sm text-[var(--coral)] transition-colors hover:bg-[var(--coral-light)]"
        >
          <Plus size={16} /> Thêm bài tập
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreateAssignment}
          className="animate-slide-up space-y-4 rounded-3xl border-2 border-[var(--coral)]/40 bg-white p-4"
        >
          <p className="font-800 text-[var(--text-primary)]">Tạo bài tập mới</p>

          {/* Type selector */}
          <div>
            <label className="font-700 mb-2 block text-xs text-[var(--text-secondary)]">
              Loại bài tập
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(TYPE_LABELS) as [
                  AssignmentTypeValue,
                  { label: string; emoji: string },
                ][]
              ).map(([t, cfg]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAType(t)}
                  className={`font-700 rounded-xl border-2 py-2.5 text-sm transition-all ${
                    aType === t
                      ? "border-[var(--coral)] bg-[var(--coral-light)] text-[var(--coral)]"
                      : "border-[var(--border)] text-[var(--text-secondary)]"
                  }`}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            autoFocus
            value={aTitle}
            onChange={(e) => setATitle(e.target.value)}
            placeholder="Tiêu đề bài tập"
            className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
          />
          <input
            value={aDesc}
            onChange={(e) => setADesc(e.target.value)}
            placeholder="Hướng dẫn cho học viên (tùy chọn)"
            className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
          />

          {/* ── Content Mode Toggle ── */}
          {(aType === "QUIZ" || aType === "FLASHCARD" || aType === "KANA_PRACTICE") && (
            <div className="flex gap-2 rounded-xl bg-[var(--cream)] p-1">
              <button
                type="button"
                onClick={() => setContentMode("preset")}
                className={`font-700 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all ${contentMode === "preset" ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"}`}
              >
                <Wand2 size={12} /> Nội dung sẵn có
              </button>
              <button
                type="button"
                onClick={() => setContentMode("custom")}
                className={`font-700 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all ${contentMode === "custom" ? "bg-white text-[var(--coral)] shadow-sm" : "text-[var(--text-secondary)]"}`}
              >
                <PenLine size={12} /> Tự tạo nội dung
              </button>
            </div>
          )}

          {/* ── Custom Content Editor ── */}
          {contentMode === "custom" && aType !== "FREE_WRITE" && (
            <div className="rounded-2xl border-2 border-[var(--coral)]/30 p-3">
              {(aType === "QUIZ" || aType === "KANA_PRACTICE") && (
                <CustomQuizEditor items={customQuizItems} onChange={setCustomQuizItems} />
              )}
              {aType === "FLASHCARD" && (
                <CustomFlashcardEditor cards={customFCards} onChange={setCustomFCards} />
              )}
            </div>
          )}

          {/* ── Content Builder (preset) ── */}
          {contentMode === "preset" && aType !== "FREE_WRITE" && (
            <div className="space-y-3 rounded-2xl border-2 border-[var(--border)] p-3">
              <p className="font-800 text-xs text-[var(--text-primary)]">Chọn nội dung bài tập</p>

              {/* Kana groups */}
              <div>
                <p className="font-700 mb-2 text-xs text-[var(--text-secondary)]">Bảng kana</p>
                <div className="grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
                  {KANA_GROUPS.map((g) => (
                    <label
                      key={g.id}
                      className={`font-600 flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-all ${
                        contentOpts.kanaGroups.includes(g.id)
                          ? "font-700 border-[var(--coral)] bg-[var(--coral-light)] text-[var(--coral)]"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--coral)]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={contentOpts.kanaGroups.includes(g.id)}
                        onChange={() => toggleKanaGroup(g.id)}
                      />
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                          contentOpts.kanaGroups.includes(g.id)
                            ? "border-[var(--coral)] bg-[var(--coral)] text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {contentOpts.kanaGroups.includes(g.id) ? "✓" : ""}
                      </span>
                      {g.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Vocab topics */}
              <div>
                <p className="font-700 mb-2 text-xs text-[var(--text-secondary)]">Từ vựng</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {VOCAB_TOPICS.map((t) => (
                    <label
                      key={t.id}
                      className={`font-600 flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                        contentOpts.vocabTopics.includes(t.id)
                          ? "font-700 border-[var(--mint-dark)] bg-[var(--mint)]/20 text-[var(--mint-dark)]"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--mint-dark)]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={contentOpts.vocabTopics.includes(t.id)}
                        onChange={() => toggleVocabTopic(t.id)}
                      />
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                          contentOpts.vocabTopics.includes(t.id)
                            ? "border-[var(--mint-dark)] bg-[var(--mint-dark)] text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {contentOpts.vocabTopics.includes(t.id) ? "✓" : ""}
                      </span>
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div>
                <label className="font-700 mb-1 block text-xs text-[var(--text-secondary)]">
                  Số câu hỏi:{" "}
                  <span className="text-[var(--coral)]">{contentOpts.questionCount}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={contentOpts.questionCount}
                  onChange={(e) =>
                    setContentOpts((p) => ({ ...p, questionCount: Number(e.target.value) }))
                  }
                  className="w-full accent-[var(--coral)]"
                />
                <div className="font-600 mt-0.5 flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          )}

          {!hasContent && aType !== "FREE_WRITE" && (
            <p className="font-700 text-xs text-orange-500">
              {contentMode === "custom"
                ? aType === "FLASHCARD"
                  ? "⚠ Thêm ít nhất 1 flashcard"
                  : "⚠ Điền đầy đủ câu hỏi và 4 lựa chọn cho tất cả câu"
                : "⚠ Chọn ít nhất 1 nhóm kana hoặc 1 chủ đề từ vựng"}
            </p>
          )}

          {/* FREE_WRITE prompt */}
          {aType === "FREE_WRITE" && (
            <div>
              <label className="font-700 mb-1 block text-xs text-[var(--text-secondary)]">
                Câu hỏi / đề bài
              </label>
              <textarea
                value={contentOpts.freeWritePrompt}
                onChange={(e) => setContentOpts((p) => ({ ...p, freeWritePrompt: e.target.value }))}
                rows={3}
                placeholder="VD: Hãy giới thiệu bản thân bằng tiếng Nhật (tên, tuổi, sở thích)."
                className="font-600 w-full resize-none rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
              />
            </div>
          )}

          {/* Due date + max score */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-700 mb-1 block text-xs text-[var(--text-secondary)]">
                Hạn nộp
              </label>
              <input
                type="datetime-local"
                value={aDueAt}
                onChange={(e) => setADueAt(e.target.value)}
                className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-3 py-2.5 text-xs transition-colors focus:border-[var(--coral)] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-700 mb-1 block text-xs text-[var(--text-secondary)]">
                Điểm tối đa
              </label>
              <input
                type="number"
                value={aMaxScore}
                min={1}
                max={1000}
                onChange={(e) => setAMaxScore(Number(e.target.value))}
                className="font-600 w-full rounded-2xl border-2 border-[var(--border)] px-3 py-2.5 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !aTitle.trim() || !hasContent}
              title={
                !aTitle.trim()
                  ? "Vui lòng nhập tiêu đề bài tập"
                  : !hasContent
                    ? "Vui lòng thêm nội dung bài tập"
                    : ""
              }
              className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : "Tạo bài tập"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="font-700 rounded-2xl border-2 border-[var(--border)] px-5 py-3 text-sm text-[var(--text-secondary)]"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Assignment list */}
      {session.assignments.length === 0 ? (
        <p className="font-600 py-8 text-center text-sm text-[var(--text-secondary)]">
          Chưa có bài tập nào.
        </p>
      ) : (
        <div className="space-y-3">
          {session.assignments.map((a) => {
            const cfg = TYPE_LABELS[a.type as AssignmentTypeValue];
            const isExpanded = expandedAssignment === a.id;
            return (
              <div
                key={a.id}
                className="overflow-hidden rounded-3xl border-2 border-[var(--border)] bg-white"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-800 text-[var(--text-primary)]">
                        {cfg.emoji} {a.title}
                      </p>
                      {a.description && (
                        <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">
                          {a.description}
                        </p>
                      )}
                      <div className="font-600 mt-1 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                        <span>{cfg.label}</span>
                        <span className="flex items-center gap-1">
                          <Star size={11} /> {a.maxScore} điểm
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {a._count.submissions} đã nộp
                        </span>
                        {a.dueAt && (
                          <span>Hạn: {new Date(a.dueAt).toLocaleDateString("vi-VN")}</span>
                        )}
                      </div>
                      {/* Source tags */}
                      {(() => {
                        const cr = a.contentRef as Record<string, unknown>;
                        const groups = (cr?.sourceGroups as string[]) ?? [];
                        const topics = (cr?.sourceTopics as string[]) ?? [];
                        if (groups.length + topics.length === 0) return null;
                        return (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {groups.slice(0, 4).map((g) => (
                              <span
                                key={g}
                                className="font-700 rounded-full bg-[var(--coral-light)] px-2 py-0.5 text-[10px] text-[var(--coral)]"
                              >
                                {g}
                              </span>
                            ))}
                            {topics.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="font-700 rounded-full bg-[var(--mint)]/20 px-2 py-0.5 text-[10px] text-[var(--mint-dark)]"
                              >
                                {t}
                              </span>
                            ))}
                            {groups.length + topics.length > 7 && (
                              <span className="font-700 rounded-full bg-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                                +{groups.length + topics.length - 7} nữa
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="shrink-0 text-gray-300 transition-colors hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {isTeacher ? (
                    <button
                      onClick={() => loadSubmissions(a.id)}
                      className="font-700 mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--cream)] py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--coral-light)] hover:text-[var(--coral)]"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Xem bài nộp ({a._count.submissions})
                    </button>
                  ) : (
                    (() => {
                      const mySub = a.submissions?.[0];
                      const done = !!mySub;
                      const graded = mySub?.status === "GRADED";
                      return (
                        <button
                          onClick={() => router.push(`/assignment/${a.id}`)}
                          className={`font-800 mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] ${
                            done
                              ? "border-2 border-[var(--mint-dark)]/30 bg-[var(--mint)]/20 text-[var(--mint-dark)]"
                              : "border-2 border-[var(--coral-dark)] bg-[var(--coral)] text-white"
                          }`}
                        >
                          {done
                            ? graded
                              ? `✅ Đã chấm · ${mySub.score} điểm — Xem lại`
                              : "✅ Đã nộp — Xem lại"
                            : "Làm bài →"}
                        </button>
                      );
                    })()
                  )}
                </div>

                {isExpanded && isTeacher && (
                  <SubmissionsPanel
                    submissions={submissions[a.id] ?? []}
                    maxScore={a.maxScore}
                    assignmentType={a.type}
                    onGrade={(subId, score, note) => handleGrade(subId, score, note, a.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm end session dialog */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEndConfirm(false)}
          />
          {/* Dialog */}
          <div className="animate-slide-up relative w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                🔒
              </div>
              <h2 className="font-900 text-lg text-[var(--text-primary)]">Kết thúc buổi học?</h2>
              <p className="font-600 text-sm leading-relaxed text-[var(--text-secondary)]">
                Học sinh sẽ <span className="font-800 text-orange-500">không thể nộp thêm bài</span>{" "}
                sau khi buổi học kết thúc. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="font-800 flex-1 rounded-2xl border-2 border-[var(--border)] py-3 text-sm text-[var(--text-secondary)] transition-all hover:bg-[var(--cream)]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  handleStatusChange("COMPLETED");
                }}
                className="font-800 flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-orange-600 bg-orange-500 py-3 text-sm text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                <Square size={14} /> Kết thúc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Submissions Panel ────────────────────────────────────────────
function SubmissionsPanel({
  submissions,
  maxScore,
  assignmentType,
  onGrade,
}: {
  submissions: Submission[];
  maxScore: number;
  assignmentType: string;
  onGrade: (subId: string, score: number, note: string) => void;
}) {
  const [editing, setEditing] = useState<Record<string, { score: string; note: string }>>({});
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  const isFreeWrite = assignmentType === "FREE_WRITE";
  // QUIZ and KANA_PRACTICE are auto-graded — teacher only needs to review, not grade
  const isAutoGraded = assignmentType === "QUIZ" || assignmentType === "KANA_PRACTICE";

  if (submissions.length === 0) {
    return (
      <div className="font-600 border-t-2 border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--text-secondary)]">
        Chưa có học viên nào nộp bài.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)] border-t-2 border-[var(--border)]">
      {submissions.map((sub) => {
        const e = editing[sub.id];
        const answers = (sub.answers as AnswerRecord[]) ?? [];
        const correctCount = answers.filter((a) => a.correct).length;
        const freeWriteText = isFreeWrite ? (answers[0]?.chosen ?? "") : "";
        const isExpA = expandedAnswers.has(sub.id);

        return (
          <div key={sub.id} className="space-y-3 px-4 py-3">
            {/* Student header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="font-900 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--coral-light)] text-sm text-[var(--coral)]">
                  {sub.student.displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-700 text-sm text-[var(--text-primary)]">
                    {sub.student.displayName}
                  </p>
                  <p className="font-600 text-xs text-[var(--text-secondary)]">
                    {new Date(sub.submittedAt).toLocaleString("vi-VN")}
                    {!isFreeWrite &&
                      answers.length > 0 &&
                      ` · ${correctCount}/${answers.length} đúng`}
                  </p>
                </div>
              </div>
              <div className="shrink-0 space-y-0.5 text-right">
                {isAutoGraded ? (
                  // Auto-graded — show score, no grade button needed
                  <div>
                    <p className="font-900 text-sm text-[var(--coral)]">
                      {sub.score}/{maxScore}
                    </p>
                    <p className="font-700 mt-0.5 flex items-center justify-end gap-0.5 text-[10px] text-[var(--mint-dark)]">
                      <CheckCircle2 size={10} /> Tự chấm
                    </p>
                  </div>
                ) : sub.status === "GRADED" && !e ? (
                  <>
                    <p className="font-900 text-sm text-[var(--coral)]">
                      {sub.score}/{maxScore}
                    </p>
                    <button
                      onClick={() =>
                        setEditing((p) => ({
                          ...p,
                          [sub.id]: { score: String(sub.score ?? ""), note: sub.teacherNote ?? "" },
                        }))
                      }
                      className="font-600 block text-xs text-[var(--text-secondary)] hover:underline"
                    >
                      Sửa
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditing((p) => ({
                        ...p,
                        [sub.id]: {
                          score: isFreeWrite
                            ? ""
                            : String(
                                Math.round((correctCount / Math.max(answers.length, 1)) * maxScore)
                              ),
                          note: sub.teacherNote ?? "",
                        },
                      }))
                    }
                    className="font-700 flex items-center gap-1 text-xs text-[var(--coral)] hover:underline"
                  >
                    <CheckCircle2 size={13} /> {sub.status === "GRADED" ? "Sửa điểm" : "Chấm điểm"}
                  </button>
                )}
              </div>
            </div>

            {/* FREE_WRITE: show student text */}
            {isFreeWrite && freeWriteText && (
              <div className="font-600 max-h-32 overflow-y-auto rounded-xl bg-[var(--cream)] p-3 text-sm whitespace-pre-wrap text-[var(--text-primary)]">
                {freeWriteText}
              </div>
            )}

            {/* Existing teacher note (graded, not editing) */}
            {sub.status === "GRADED" && sub.teacherNote && !e && (
              <div className="rounded-xl bg-blue-50 px-3 py-2">
                <p className="font-800 mb-0.5 text-[10px] text-blue-500">Nhận xét đã lưu</p>
                <p className="font-600 text-xs whitespace-pre-wrap text-blue-700">
                  {sub.teacherNote}
                </p>
              </div>
            )}

            {/* Grade form */}
            {e && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="shrink-0">
                    <label className="font-700 mb-0.5 block text-[10px] text-[var(--text-secondary)]">
                      Điểm
                    </label>
                    <input
                      type="number"
                      value={e.score}
                      min={0}
                      max={maxScore}
                      onChange={(ev) =>
                        setEditing((p) => ({ ...p, [sub.id]: { ...e, score: ev.target.value } }))
                      }
                      className="font-700 w-20 rounded-xl border-2 border-[var(--coral)] px-3 py-2 text-center text-sm focus:outline-none"
                      placeholder={`/${maxScore}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-700 mb-0.5 block text-[10px] text-[var(--text-secondary)]">
                      {isFreeWrite ? "Bài chữa / nhận xét" : "Nhận xét"}
                    </label>
                    {isFreeWrite ? (
                      <textarea
                        value={e.note}
                        onChange={(ev) =>
                          setEditing((p) => ({ ...p, [sub.id]: { ...e, note: ev.target.value } }))
                        }
                        placeholder="Viết bài chữa, nhận xét cho học viên..."
                        rows={4}
                        className="font-600 w-full resize-none rounded-xl border-2 border-[var(--border)] px-3 py-2 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                      />
                    ) : (
                      <input
                        value={e.note}
                        onChange={(ev) =>
                          setEditing((p) => ({ ...p, [sub.id]: { ...e, note: ev.target.value } }))
                        }
                        placeholder="Nhận xét ngắn gọn (tùy chọn)"
                        className="font-600 w-full rounded-xl border-2 border-[var(--border)] px-3 py-2 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onGrade(sub.id, Number(e.score), e.note);
                      setEditing((p) => {
                        const n = { ...p };
                        delete n[sub.id];
                        return n;
                      });
                    }}
                    className="font-700 flex-1 rounded-xl border border-[var(--coral-dark)] bg-[var(--coral)] py-2 text-xs text-white"
                  >
                    Lưu điểm
                  </button>
                  <button
                    onClick={() =>
                      setEditing((p) => {
                        const n = { ...p };
                        delete n[sub.id];
                        return n;
                      })
                    }
                    className="font-700 rounded-xl border-2 border-[var(--border)] px-4 py-2 text-xs text-[var(--text-secondary)]"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Quiz/KANA answers preview */}
            {!isFreeWrite && answers.length > 0 && (
              <div>
                <button
                  onClick={() =>
                    setExpandedAnswers((p) => {
                      const s = new Set(p);
                      s.has(sub.id) ? s.delete(sub.id) : s.add(sub.id);
                      return s;
                    })
                  }
                  className="font-700 flex items-center gap-1 text-[10px] text-[var(--text-secondary)] transition-colors hover:text-[var(--coral)]"
                >
                  {isExpA ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  {isExpA ? "Ẩn" : "Xem"} chi tiết đáp án
                </button>
                {isExpA && (
                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                    {answers.map((a, i) => (
                      <div
                        key={i}
                        className={`font-600 rounded-lg px-2 py-1 text-xs ${a.correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                      >
                        {a.correct ? "✓" : "✗"} {a.prompt}: {a.chosen}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4 px-4 pt-4">
      <div className="h-6 w-1/2 rounded-xl bg-[var(--border)]" />
      <div className="h-24 rounded-3xl border-2 border-[var(--border)] bg-white" />
      <div className="h-24 rounded-3xl border-2 border-[var(--border)] bg-white" />
    </div>
  );
}
