"use client";

/**
 * RoadmapFetcher — Loads progress from DB via Server Action, passes to Container
 */

import { roadmapLessons } from "@/data/roadmap";
import { useProgress } from "@/lib/useProgress";
import RoadmapContainer from "./RoadmapContainer";

export default function RoadmapFetcher() {
  const { progress, loading } = useProgress();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-2xl border-2 border-[var(--border)] bg-white" />
        ))}
      </div>
    );
  }

  return <RoadmapContainer lessons={roadmapLessons} initialProgress={progress} />;
}
