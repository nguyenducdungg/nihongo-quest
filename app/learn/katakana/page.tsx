import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CharacterFetcher from "@/components/character/CharacterFetcher";

/**
 * Katakana learn page — Flip-card kana learning for Katakana groups
 */
export default function KatakanaPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/learn"
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-white transition-colors hover:border-[var(--mint)]"
        >
          <ChevronLeft size={18} className="text-[var(--text-primary)]" />
        </Link>
        <h1 className="font-800 text-xl text-[var(--text-primary)]">Học Katakana ⭐</h1>
      </div>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <CharacterFetcher writingSystem="katakana" />
      </Suspense>
    </div>
  );
}
