"use client";

/**
 * Student — Take Assignment page
 * Phases: intro → quiz/flashcard/freewrite → result
 * After submission, student can review answers and see teacher feedback
 */

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAssignmentForStudent } from "@/app/actions/assignment";
import { submitAssignment, AnswerRecord } from "@/app/actions/submission";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Star,
  Loader2,
  RotateCcw,
  BookOpen,
  XCircle,
  MessageSquare,
} from "lucide-react";

type Assignment = Awaited<ReturnType<typeof getAssignmentForStudent>>;
type QuizQuestion = { id: string; prompt: string; answer: string; choices: string[] };
type FlashCard = { id: string; front: string; back: string; reading?: string };

export default function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<
    "intro" | "quiz" | "flashcard" | "freewrite" | "result" | "review"
  >("intro");
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    getAssignmentForStudent(id).then((a) => {
      setAssignment(a);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const alreadySubmitted = (assignment?.submissions.length ?? 0) > 0;
  const sub = assignment?.submissions[0];

  const handleQuizDone = async (records: AnswerRecord[], finalScore: number) => {
    setAnswers(records);
    setScore(finalScore);
    setSubmitting(true);
    await submitAssignment(id, records, finalScore);
    setSubmitting(false);
    setPhase("result");
    load();
  };

  if (loading) return <AssignmentLoader />;

  if (!assignment)
    return (
      <div className="mx-auto max-w-lg space-y-3 px-4 pt-16 text-center">
        <p className="text-4xl">🔒</p>
        <p className="font-800 text-[var(--text-primary)]">Bài tập không tìm thấy</p>
        <p className="font-600 text-sm text-[var(--text-secondary)]">
          Bài tập chưa được mở hoặc bạn chưa vào lớp học này.
        </p>
        <button
          onClick={() => router.push("/my-classes")}
          className="font-700 text-sm text-[var(--coral)] hover:underline"
        >
          ← Về lớp học
        </button>
      </div>
    );

  const contentRef = assignment.contentRef as Record<string, unknown>;
  const questions = (contentRef.questions as QuizQuestion[]) ?? [];
  const cards = (contentRef.cards as FlashCard[]) ?? [];
  const freeWritePrompt = (contentRef.prompt as string) ?? "";
  const type = assignment.type as "QUIZ" | "KANA_PRACTICE" | "FLASHCARD" | "FREE_WRITE";
  const submittedAnswers = sub ? (sub.answers as AnswerRecord[]) : [];

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
      {/* Header */}
      <button
        onClick={() => router.push("/my-classes")}
        className="font-600 mb-4 flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--coral)]"
      >
        <ArrowLeft size={16} /> Lớp học
      </button>

      {/* Already submitted — summary card */}
      {alreadySubmitted && phase === "intro" && sub && (
        <div className="mb-4 space-y-3 rounded-3xl border-2 border-[var(--mint)]/40 bg-white p-6 text-center">
          <p className="text-4xl">🎊</p>
          <p className="font-900 text-lg text-[var(--text-primary)]">Bạn đã nộp bài!</p>
          {sub.status === "GRADED" ? (
            <div className="space-y-1">
              <p className="font-900 text-3xl text-[var(--coral)]">
                {sub.score}
                <span className="text-base text-[var(--text-secondary)]">
                  /{assignment.maxScore}
                </span>
              </p>
              <p className="font-600 text-sm text-[var(--text-secondary)]">điểm của bạn</p>
              {/* Show graded-by label */}
              {type === "QUIZ" || type === "KANA_PRACTICE" ? (
                <p className="font-700 mt-1 flex items-center justify-center gap-1 text-xs text-[var(--mint-dark)]">
                  <CheckCircle2 size={12} /> Hệ thống chấm tự động
                </p>
              ) : sub.teacherNote ? (
                <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-left">
                  <p className="font-800 mb-1 flex items-center gap-1 text-xs text-blue-600">
                    <MessageSquare size={12} /> Nhận xét của giáo viên
                  </p>
                  <p className="font-600 text-sm text-blue-800">{sub.teacherNote}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="font-600 flex items-center justify-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <Clock size={14} /> Đang chờ giáo viên chấm điểm...
            </p>
          )}
          <div className="flex gap-2 pt-1">
            {type !== "FREE_WRITE" && submittedAnswers.length > 0 && (
              <button
                onClick={() => setPhase("review")}
                className="font-700 flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--coral)]/30 py-2.5 text-sm text-[var(--coral)] transition-colors hover:bg-[var(--coral-light)]"
              >
                <BookOpen size={14} /> Xem lại kết quả
              </button>
            )}
            {type === "FREE_WRITE" && sub.status === "GRADED" && (
              <button
                onClick={() => setPhase("review")}
                className="font-700 flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-200 py-2.5 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              >
                <BookOpen size={14} /> Xem bài chữa
              </button>
            )}
            <button
              onClick={() =>
                setPhase(
                  type === "FLASHCARD" ? "flashcard" : type === "FREE_WRITE" ? "freewrite" : "quiz"
                )
              }
              className="font-700 flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--border)] py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--coral)] hover:text-[var(--coral)]"
            >
              <RotateCcw size={14} /> Làm lại
            </button>
          </div>
        </div>
      )}

      {/* Review panel — quiz/kana/flashcard */}
      {phase === "review" && sub && type !== "FREE_WRITE" && (
        <ReviewPanel
          type={type}
          answers={submittedAnswers}
          questions={type === "FLASHCARD" ? undefined : questions}
          cards={type === "FLASHCARD" ? cards : undefined}
          score={sub.score ?? 0}
          maxScore={assignment.maxScore}
          teacherNote={sub.teacherNote ?? null}
          onBack={() => setPhase("intro")}
        />
      )}

      {/* Review panel — FREE_WRITE */}
      {phase === "review" && sub && type === "FREE_WRITE" && (
        <FreeWriteReview
          prompt={freeWritePrompt}
          studentAnswer={submittedAnswers[0]?.chosen ?? ""}
          score={sub.score ?? null}
          maxScore={assignment.maxScore}
          teacherNote={sub.teacherNote ?? null}
          gradedAt={sub.gradedAt ? new Date(sub.gradedAt).toLocaleString("vi-VN") : null}
          onBack={() => setPhase("intro")}
        />
      )}

      {/* Intro / start screen */}
      {phase === "intro" && (
        <div className="space-y-4 rounded-3xl border-2 border-[var(--border)] bg-white p-6">
          <div>
            <p className="font-700 text-xs tracking-wide text-[var(--text-secondary)] uppercase">
              {assignment.session.classroom.name}
            </p>
            <h1 className="font-900 mt-1 text-xl text-[var(--text-primary)]">{assignment.title}</h1>
            {assignment.description && (
              <p className="font-600 mt-1 text-sm text-[var(--text-secondary)]">
                {assignment.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoChip
              icon={<Star size={14} />}
              label="Điểm tối đa"
              value={`${assignment.maxScore} điểm`}
            />
            <InfoChip
              icon={<Clock size={14} />}
              label="Số câu"
              value={`${type === "FLASHCARD" ? cards.length : questions.length} câu`}
            />
          </div>
          {assignment.dueAt && (
            <p className="font-600 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <Clock size={12} /> Hạn nộp: {new Date(assignment.dueAt).toLocaleString("vi-VN")}
            </p>
          )}
          {!alreadySubmitted && (
            <button
              onClick={() =>
                setPhase(
                  type === "FLASHCARD" ? "flashcard" : type === "FREE_WRITE" ? "freewrite" : "quiz"
                )
              }
              className="font-800 w-full rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-4 text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Bắt đầu làm bài →
            </button>
          )}
        </div>
      )}

      {/* Quiz phase */}
      {phase === "quiz" && questions.length > 0 && (
        <QuizRunner questions={questions} maxScore={assignment.maxScore} onDone={handleQuizDone} />
      )}

      {/* Flashcard phase */}
      {phase === "flashcard" && cards.length > 0 && (
        <FlashcardRunner cards={cards} maxScore={assignment.maxScore} onDone={handleQuizDone} />
      )}

      {/* Free write phase */}
      {phase === "freewrite" && (
        <FreeWriteRunner
          prompt={freeWritePrompt}
          maxScore={assignment.maxScore}
          onDone={handleQuizDone}
        />
      )}

      {/* Result phase */}
      {phase === "result" && (
        <div className="space-y-4 rounded-3xl border-2 border-[var(--mint)]/40 bg-white p-8 text-center">
          {type === "FREE_WRITE" ? (
            <>
              <p className="text-5xl">📬</p>
              <p className="font-900 text-xl text-[var(--text-primary)]">Đã nộp bài!</p>
              <p className="font-600 flex items-center justify-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Clock size={14} /> Đang chờ giáo viên chấm điểm...
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl">
                {score >= assignment.maxScore * 0.8
                  ? "🏆"
                  : score >= assignment.maxScore * 0.5
                    ? "👏"
                    : "💪"}
              </p>
              <div>
                <p className="font-900 text-4xl text-[var(--coral)]">
                  {score}
                  <span className="text-lg text-[var(--text-secondary)]">
                    /{assignment.maxScore}
                  </span>
                </p>
                <p className="font-600 mt-1 text-sm text-[var(--text-secondary)]">điểm của bạn</p>
              </div>
            </>
          )}
          {submitting && (
            <p className="font-600 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
              <Loader2 size={14} className="animate-spin" /> Đang nộp bài...
            </p>
          )}
          {!submitting && (type === "QUIZ" || type === "KANA_PRACTICE") && (
            <p className="font-700 flex items-center justify-center gap-1.5 text-xs text-[var(--mint-dark)]">
              <CheckCircle2 size={14} /> Hệ thống đã chấm tự động
            </p>
          )}
          <div className="flex gap-2">
            {type !== "FREE_WRITE" && answers.length > 0 && (
              <button
                onClick={() => setPhase("review")}
                className="font-800 flex-1 rounded-2xl border-2 border-[var(--coral)] py-3.5 text-[var(--coral)] transition-all hover:bg-[var(--coral-light)]"
              >
                Xem lại đáp án
              </button>
            )}
            <button
              onClick={() => router.push("/my-classes")}
              className="font-800 flex-1 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-3.5 text-white"
            >
              Về lớp học
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Review Panel (Quiz / KANA) =====

function ReviewPanel({
  type,
  answers,
  questions,
  cards,
  score,
  maxScore,
  teacherNote,
  onBack,
}: {
  type: string;
  answers: AnswerRecord[];
  questions?: QuizQuestion[];
  cards?: FlashCard[];
  score: number;
  maxScore: number;
  teacherNote: string | null;
  onBack: () => void;
}) {
  const correctCount = answers.filter((a) => a.correct).length;
  const total = answers.length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-3xl border-2 border-[var(--border)] bg-white p-4">
        <div>
          <p className="font-800 text-sm text-[var(--text-primary)]">Kết quả chi tiết</p>
          <p className="font-600 mt-0.5 text-xs text-[var(--text-secondary)]">
            {correctCount}/{total} đúng
          </p>
        </div>
        <div className="text-right">
          <p className="font-900 text-2xl text-[var(--coral)]">{score}</p>
          <p className="font-600 text-xs text-[var(--text-secondary)]">/{maxScore} điểm</p>
        </div>
      </div>

      {/* Teacher note if any */}
      {teacherNote && (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
          <p className="font-800 mb-1.5 flex items-center gap-1.5 text-xs text-blue-600">
            <MessageSquare size={12} /> Nhận xét của giáo viên
          </p>
          <p className="font-600 text-sm text-blue-800">{teacherNote}</p>
        </div>
      )}

      {/* Answer list */}
      <div className="space-y-2">
        {answers.map((rec, idx) => {
          const q = questions?.find((x) => x.id === rec.questionId);
          const correctAnswer = q?.answer ?? rec.chosen;
          return (
            <div
              key={idx}
              className={`rounded-2xl border-2 bg-white p-3.5 ${rec.correct ? "border-green-200" : "border-red-200"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${rec.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                >
                  {rec.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-900 kana-text text-lg leading-tight text-[var(--text-primary)]">
                    {rec.prompt}
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    {rec.correct ? (
                      <p className="font-700 text-sm text-green-700">✓ {rec.chosen}</p>
                    ) : (
                      <>
                        <p className="font-700 text-sm text-red-500 line-through">✗ {rec.chosen}</p>
                        <p className="font-700 text-sm text-green-700">✓ {correctAnswer}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--border)] py-3.5 text-[var(--text-secondary)] transition-all hover:border-[var(--coral)] hover:text-[var(--coral)]"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>
    </div>
  );
}

// ===== Free Write Review =====

function FreeWriteReview({
  prompt,
  studentAnswer,
  score,
  maxScore,
  teacherNote,
  gradedAt,
  onBack,
}: {
  prompt: string;
  studentAnswer: string;
  score: number | null;
  maxScore: number;
  teacherNote: string | null;
  gradedAt: string | null;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        {/* Prompt */}
        <div>
          <p className="font-700 mb-1.5 text-xs tracking-wide text-[var(--text-secondary)] uppercase">
            Đề bài
          </p>
          <p className="font-700 text-[var(--text-primary)]">{prompt}</p>
        </div>

        {/* Student answer */}
        <div>
          <p className="font-700 mb-1.5 text-xs tracking-wide text-[var(--text-secondary)] uppercase">
            Bài làm của bạn
          </p>
          <div className="rounded-2xl bg-[var(--cream)] p-4">
            <p className="font-600 text-sm whitespace-pre-wrap text-[var(--text-primary)]">
              {studentAnswer}
            </p>
          </div>
        </div>

        {/* Score */}
        {score !== null && (
          <div className="flex items-center justify-between rounded-2xl bg-[var(--coral-light)] p-3">
            <p className="font-700 text-sm text-[var(--text-primary)]">Điểm số</p>
            <p className="font-900 text-xl text-[var(--coral)]">
              {score}
              <span className="text-sm text-[var(--text-secondary)]">/{maxScore}</span>
            </p>
          </div>
        )}

        {/* Teacher note / correction */}
        {teacherNote ? (
          <div className="space-y-1.5 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
            <p className="font-800 flex items-center gap-1.5 text-xs text-blue-600">
              <MessageSquare size={12} /> Bài chữa của giáo viên
            </p>
            <p className="font-600 text-sm whitespace-pre-wrap text-blue-800">{teacherNote}</p>
            {gradedAt && <p className="font-600 pt-1 text-xs text-blue-400">Chấm lúc {gradedAt}</p>}
          </div>
        ) : (
          <div className="font-600 flex items-center justify-center gap-1.5 py-2 text-center text-sm text-[var(--text-secondary)]">
            <Clock size={14} /> Đang chờ giáo viên chữa bài...
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--border)] py-3.5 text-[var(--text-secondary)] transition-all hover:border-[var(--coral)] hover:text-[var(--coral)]"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>
    </div>
  );
}

// ===== Quiz Runner =====

function QuizRunner({
  questions,
  maxScore,
  onDone,
}: {
  questions: QuizQuestion[];
  maxScore: number;
  onDone: (answers: AnswerRecord[], score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const [shakingChoice, setShakingChoice] = useState<string | null>(null);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[index];

  const handleSelect = (choice: string) => {
    if (solved || wrongAttempts.has(choice)) return;
    if (choice === q.answer) {
      const firstTry = wrongAttempts.size === 0;
      if (firstTry) setCorrectCount((c) => c + 1);
      setSolved(true);
      setRecords((prev) => [
        ...prev,
        { questionId: q.id, prompt: q.prompt, chosen: choice, correct: firstTry },
      ]);
      setTimeout(() => {
        if (index + 1 >= questions.length) {
          const finalScore = Math.round(
            ((firstTry ? correctCount + 1 : correctCount) / questions.length) * maxScore
          );
          const allRecords = [
            ...records,
            { questionId: q.id, prompt: q.prompt, chosen: choice, correct: firstTry },
          ];
          onDone(allRecords, finalScore);
        } else {
          setIndex((i) => i + 1);
          setWrongAttempts(new Set());
          setSolved(false);
          setShakingChoice(null);
        }
      }, 700);
    } else {
      setWrongAttempts((prev) => new Set(prev).add(choice));
      setShakingChoice(choice);
      setTimeout(() => setShakingChoice(null), 400);
    }
  };

  const progress = (index / questions.length) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="font-700 mb-1.5 flex justify-between text-xs text-[var(--text-secondary)]">
          <span>
            Câu {index + 1}/{questions.length}
          </span>
          <span>{correctCount} đúng</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--coral)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-8 text-center">
        <p className="font-900 kana-text text-5xl text-[var(--text-primary)]">{q.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.choices.map((c) => {
          const isCorrect = solved && c === q.answer;
          const isWrong = wrongAttempts.has(c);
          const isShaking = shakingChoice === c;
          return (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              disabled={isWrong || (solved && c !== q.answer)}
              className={`font-800 rounded-2xl border-2 py-4 text-base transition-all ${isShaking ? "animate-bounce-in" : ""} ${
                isCorrect
                  ? "border-green-400 bg-green-100 text-green-700"
                  : isWrong
                    ? "border-red-200 bg-red-50 text-red-300 line-through"
                    : "border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-[var(--coral)] hover:bg-[var(--coral-light)] active:scale-95"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== Flashcard Runner =====

function FlashcardRunner({
  cards,
  maxScore,
  onDone,
}: {
  cards: FlashCard[];
  maxScore: number;
  onDone: (answers: AnswerRecord[], score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const card = cards[index];

  const handleKnown = () => {
    setKnownCount((c) => c + 1);
    advance(true);
  };
  const handleReview = () => advance(false);

  const advance = (known: boolean) => {
    if (index + 1 >= cards.length) {
      const finalKnown = knownCount + (known ? 1 : 0);
      const score = Math.round((finalKnown / cards.length) * maxScore);
      const records: AnswerRecord[] = cards.map((c, i) => ({
        questionId: c.id,
        prompt: c.front,
        chosen: c.back,
        correct: i < finalKnown,
      }));
      onDone(records, score);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-700 mb-1.5 flex justify-between text-xs text-[var(--text-secondary)]">
        <span>
          {index + 1}/{cards.length}
        </span>
        <span className="text-[var(--mint-dark)]">✓ {knownCount} nhớ rồi</span>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[var(--border)] bg-white p-10 text-center transition-all hover:shadow-md"
      >
        {!flipped ? (
          <>
            <p className="font-900 kana-text text-5xl text-[var(--text-primary)]">{card.front}</p>
            {card.reading && (
              <p className="kana-text text-lg text-[var(--text-secondary)]">{card.reading}</p>
            )}
            <p className="font-600 mt-2 text-xs text-[var(--text-secondary)]">Chạm để lật</p>
          </>
        ) : (
          <>
            <p className="font-800 text-2xl text-[var(--text-primary)]">{card.back}</p>
            <p className="font-600 mt-2 text-xs text-[var(--text-secondary)]">Chạm để lật lại</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleReview}
          className="font-800 rounded-2xl border-2 border-[var(--border)] py-4 text-[var(--text-secondary)] transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-500"
        >
          🔄 Ôn thêm
        </button>
        <button
          onClick={handleKnown}
          className="font-800 rounded-2xl border-2 border-[var(--mint-dark)] bg-[var(--mint)] py-4 text-[var(--mint-dark)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          ✅ Nhớ rồi
        </button>
      </div>
    </div>
  );
}

// ===== Free Write Runner =====

function FreeWriteRunner({
  prompt,
  maxScore,
  onDone,
}: {
  prompt: string;
  maxScore: number;
  onDone: (answers: AnswerRecord[], score: number) => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    const records: AnswerRecord[] = [
      { questionId: "free-write", prompt, chosen: text, correct: false },
    ];
    onDone(records, 0);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <p className="font-700 mb-2 text-xs tracking-wide text-[var(--text-secondary)] uppercase">
          Đề bài
        </p>
        <p className="font-700 text-[var(--text-primary)]">{prompt}</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Viết câu trả lời của bạn ở đây..."
        className="font-600 w-full resize-none rounded-2xl border-2 border-[var(--border)] px-4 py-3 text-sm transition-colors focus:border-[var(--coral)] focus:outline-none"
      />
      <p className="font-600 text-right text-xs text-[var(--text-secondary)]">
        {text.length} ký tự
      </p>
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        className="font-800 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--coral-dark)] bg-[var(--coral)] py-4 text-white disabled:opacity-50"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : "Nộp bài ✓"}
      </button>
    </div>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--cream)] p-3 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-[var(--text-secondary)]">
        {icon}
      </div>
      <p className="font-900 text-base text-[var(--text-primary)]">{value}</p>
      <p className="font-600 text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function AssignmentLoader() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4 px-4 pt-6 pb-28">
      <div className="mb-6 h-4 w-24 rounded-xl bg-[var(--border)]" />
      <div className="h-6 w-56 rounded-xl bg-[var(--border)]" />
      <div className="h-4 w-40 rounded-xl bg-[var(--border)]" />
      <div className="h-40 rounded-3xl border-2 border-[var(--border)] bg-white" />
      <div className="h-12 rounded-2xl bg-[var(--border)]" />
    </div>
  );
}
