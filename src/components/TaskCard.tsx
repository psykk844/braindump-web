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
        className={`card-task p-4 transition-all duration-150 ${
          swipeX > 0 ? "border-[var(--success)]" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => onComplete(id)}
            className="w-5 h-5 mt-0.5 rounded-full border-2 border-[var(--border-dark)] hover:border-[var(--success)] flex-shrink-0 transition-all duration-150 hover:bg-[var(--success-light)]"
            aria-label="Complete task"
          />
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p className="text-body text-[var(--text-primary)] leading-relaxed">{title}</p>
            {note && !expanded && (
              <p className="text-small text-[var(--text-tertiary)] mt-1">📝 Note attached</p>
            )}
          </div>
          <div 
            className="text-[var(--text-quaternary)] cursor-grab active:cursor-grabbing hover:text-[var(--text-secondary)] transition-colors text-2xl px-2 select-none" 
            {...attributes} 
            {...listeners}
            title="Drag to reorder"
          >
            ⋮⋮
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[var(--border-light)] animate-in fade-in duration-150">
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full bg-[var(--bg-secondary)] text-small text-[var(--text-primary)] rounded-[var(--radius-md)] p-3 resize-none h-24 border border-[var(--border-medium)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setExpanded(false)}
                className="text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-[var(--radius-md)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNoteSave}
                className="btn-primary text-small px-4 py-2"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {swipeX > 40 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--success)] text-body-medium flex items-center gap-2 font-medium">
          <span className="text-xl">✓</span> Done
        </div>
      )}
    </div>
  );
}
