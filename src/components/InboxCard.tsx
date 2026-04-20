"use client";

import { useState } from "react";

interface InboxCardProps {
  id: number;
  rawText: string;
  type: "link" | "idea" | "todo";
  url: string | null;
  category: string;
  onPromoteToTask: (id: number) => void;
  onArchive: (id: number) => void;
  onReclassify: (id: number, type: string) => void;
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  link: { label: "Link", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  idea: { label: "Idea", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  todo: { label: "Todo", color: "bg-[var(--status-green)]/10 text-[var(--status-green)] border-[var(--status-green)]/20" },
};

export default function InboxCard({
  id,
  rawText,
  type,
  url,
  category,
  onPromoteToTask,
  onArchive,
  onReclassify,
}: InboxCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);

  const badge = TYPE_BADGES[type] || TYPE_BADGES.idea;

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = e.touches[0].clientX - touchStart;
    setSwipeX(Math.max(-100, Math.min(100, diff)));
  }

  function handleTouchEnd() {
    if (swipeX > 80) onPromoteToTask(id);
    if (swipeX < -80) onArchive(id);
    setSwipeX(0);
    setTouchStart(null);
  }

  function cycleType() {
    const types = ["link", "idea", "todo"];
    const next = types[(types.indexOf(type) + 1) % types.length];
    onReclassify(id, next);
  }

  return (
    <div className="relative mb-3 overflow-hidden rounded-[var(--radius-md)]">
      {swipeX > 40 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--status-green)] text-small-medium z-10 flex items-center gap-1">
          <span className="text-lg">→</span> Task
        </div>
      )}
      {swipeX < -40 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-quaternary)] text-small-medium z-10 flex items-center gap-1">
          Archive <span className="text-lg">←</span>
        </div>
      )}

      <div
        className="card-linear p-4 transition-all duration-150"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-2 mb-3">
          <button
            onClick={cycleType}
            className={`px-2 py-1 rounded-[var(--radius-sm)] text-label border transition-colors ${badge.color}`}
          >
            {badge.label}
          </button>
          {category !== "uncategorized" && (
            <span className="px-2 py-1 rounded-[var(--radius-sm)] text-label bg-[var(--bg-surface)] text-[var(--text-quaternary)] border border-[var(--border-subtle)]">
              {category}
            </span>
          )}
        </div>

        <p className="text-small-medium text-[var(--text-primary)] mb-3 whitespace-pre-wrap break-words leading-relaxed">
          {rawText}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-[var(--accent-violet)] hover:text-[var(--accent-hover)] block mb-3 truncate transition-colors"
          >
            {url}
          </a>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onPromoteToTask(id)}
            className="flex-1 py-2 rounded-[var(--radius-sm)] bg-[var(--status-green)]/10 text-[var(--status-green)] text-label border border-[var(--status-green)]/20 hover:bg-[var(--status-green)]/20 transition-all duration-150"
          >
            → Task
          </button>
          <button
            onClick={() => onArchive(id)}
            className="flex-1 py-2 btn-ghost text-label"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
