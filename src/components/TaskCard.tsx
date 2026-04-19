"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TaskCardProps {
  id: number;
  title: string;
  note: string;
  bucket: string;
  onComplete: (id: number) => void;
  onUpdateNote: (id: number, note: string) => void;
}

export default function TaskCard({
  id,
  title,
  note,
  bucket,
  onComplete,
  onUpdateNote,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editNote, setEditNote] = useState(note);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = e.touches[0].clientX - touchStart;
    if (diff > 0) setSwipeX(Math.min(diff, 100));
  }

  function handleTouchEnd() {
    if (swipeX > 80) {
      onComplete(id);
    }
    setSwipeX(0);
    setTouchStart(null);
  }

  function handleNoteSave() {
    onUpdateNote(id, editNote);
    setExpanded(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className={`bg-zinc-800 rounded-lg p-3 mb-2 border border-zinc-700 transition-transform ${
          swipeX > 0 ? "border-green-500/50" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onComplete(id)}
            className="w-5 h-5 rounded-full border-2 border-zinc-500 hover:border-green-400 flex-shrink-0 transition-colors"
          />
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
            {...attributes}
            {...listeners}
          >
            <p className="text-sm text-zinc-100 truncate">{title}</p>
            {note && !expanded && (
              <p className="text-[10px] text-zinc-500 mt-0.5">📝 Note</p>
            )}
          </div>
          <div className="text-zinc-600 cursor-grab" {...attributes} {...listeners}>
            ⠿
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full bg-zinc-900 text-sm text-zinc-300 rounded p-2 resize-none h-20 border border-zinc-700 focus:border-zinc-500 focus:outline-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleNoteSave}
                className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {swipeX > 40 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-green-400 text-sm font-medium">
          ✓ Done
        </div>
      )}
    </div>
  );
}
