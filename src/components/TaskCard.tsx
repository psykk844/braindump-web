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
    <div ref={setNodeRef} style={style} className="task-item">
      {swipeX > 40 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-green)] text-body flex items-center gap-1">
          <span>✓</span> Done
        </div>
      )}
      
      <div
        className="flex items-center gap-2 py-2 px-3"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => onComplete(id)}
          className="text-body text-[var(--text-tertiary)] hover:text-[var(--accent-green)] transition-colors"
          aria-label="Complete task"
        >
          [ ]
        </button>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <p className="text-body text-[var(--text-primary)] truncate">{title}</p>
        </div>
        {note && !expanded && (
          <span className="text-tiny text-[var(--text-muted)]">📝</span>
        )}
        <div 
          className="text-body text-[var(--text-muted)] cursor-grab active:cursor-grabbing hover:text-[var(--text-tertiary)] transition-colors select-none px-1" 
          {...attributes} 
          {...listeners}
          title="Drag to reorder"
        >
          ⋮
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-2 border-t border-[var(--border)]">
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full bg-[var(--bg-secondary)] text-small text-[var(--text-primary)] p-2 resize-none h-20 border border-[var(--border)] focus:border-[var(--accent-blue)] focus:outline-none transition-colors mt-2"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setExpanded(false)}
              className="text-tiny text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-2 py-1 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNoteSave}
              className="btn btn-primary text-tiny"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
