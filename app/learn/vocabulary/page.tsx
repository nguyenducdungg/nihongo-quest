import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import VocabFetcher from "@/components/vocabulary/VocabFetcher";

/**
 * Vocabulary learn page — Flashcard-style vocabulary learning by topic
 */
export default function VocabularyPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/learn"
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white transition-colors hover:border-[var(--yellow-dark)]"
        >
          <ChevronLeft size={18} className="text-[var(--text-primary)]" />
        </Link>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Từ vựng 📖</h1>
      </div>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-white" />}>
        <VocabFetcher />
      </Suspense>
    </div>
  );
}
