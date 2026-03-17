import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import QuizFetcher from "@/components/quiz/QuizFetcher";

/**
 * Roadmap quiz page — auto-generated quiz following the learning roadmap
 */
export default function RoadmapQuizPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/quiz"
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white transition-colors hover:border-[var(--coral)]"
        >
          <ChevronLeft size={18} />
        </Link>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Quiz lộ trình ⚡</h1>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-white" />}>
        <QuizFetcher />
      </Suspense>
    </div>
  );
}
