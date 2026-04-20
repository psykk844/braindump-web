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
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className={`card-linear p-3 mb-2 transition-all duration-150 ${
          swipeX > 0 ? "border-[var(--status-green)]/50" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onComplete(id)}
            className="w-4 h-4 rounded-full border border-[var(--border-secondary)] hover:border-[var(--status-green)] flex-shrink-0 transition-all duration-150 hover:bg-[var(--status-green)]/10"
            aria-label="Complete task"
          />
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
            {...attributes}
            {...listeners}
          >
            <p className="text-small-medium text-[var(--text-primary)] leading-snug">{title}</p>
            {note && !expanded && (
              <p className="text-label text-[var(--text-tertiary)] mt-1">Note attached</p>
            )}
          </div>
          <div 
            className="text-[var(--text-quaternary)] cursor-grab hover:text-[var(--text-tertiary)] transition-colors text-sm" 
            {...attributes} 
            {...listeners}
          >
            ⋮⋮
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] animate-in fade-in duration-150">
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full bg-[var(--bg-panel)] text-caption text-[var(--text-secondary)] rounded-[var(--radius-sm)] p-2 resize-none h-20 border border-[var(--border-standard)] focus:border-[var(--border-secondary)] focus:outline-none transition-colors"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setExpanded(false)}
                className="text-label text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNoteSave}
                className="btn-ghost text-label px-3 py-1.5"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {swipeX > 40 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--status-green)] text-small-medium flex items-center gap-1">
          <span className="text-lg">✓</span> Done
        </div>
      )}
    </div>
  );
}
