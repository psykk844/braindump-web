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
  link: { label: "🔗 Link", color: "bg-blue-500/20 text-blue-400" },
  idea: { label: "💡 Idea", color: "bg-yellow-500/20 text-yellow-400" },
  todo: { label: "✅ Todo", color: "bg-green-500/20 text-green-400" },
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
    <div className="relative mb-3 overflow-hidden rounded-lg">
      {/* Swipe indicators */}
      {swipeX > 40 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-green-400 text-sm font-medium z-10">
          → Task
        </div>
      )}
      {swipeX < -40 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium z-10">
          Archive ←
        </div>
      )}

      <div
        className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 transition-transform"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={cycleType}
            className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}
          >
            {badge.label}
          </button>
          {category !== "uncategorized" && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-400">
              {category}
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-200 mb-3 whitespace-pre-wrap break-words">
          {rawText}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline block mb-3 truncate"
          >
            {url}
          </a>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onPromoteToTask(id)}
            className="flex-1 py-1.5 rounded bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors"
          >
            → Task
          </button>
          <button
            onClick={() => onArchive(id)}
            className="flex-1 py-1.5 rounded bg-zinc-700 text-zinc-400 text-xs font-medium hover:bg-zinc-600 transition-colors"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
