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
    if (diff > 0) setSwipeX(Math.min(diff, 96));
  }

  function handleTouchEnd() {
    if (swipeX > 72) onComplete(id);
    setSwipeX(0);
    setTouchStart(null);
  }

  function handleNoteSave() {
    onUpdateNote(id, editNote);
    setExpanded(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="task-item relative">
      {swipeX > 36 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-success)] text-small">
          [x] done
        </div>
      )}

      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => onComplete(id)}
          className="text-small text-[var(--text-dim)] hover:text-[var(--accent-success)]"
          aria-label="Complete task"
        >
          [ ]
        </button>

        <span className="text-small text-[var(--text-muted)] w-10">#{id}</span>

        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle task details"
        >
          <p className="text-body text-[var(--text)] truncate">{title}</p>
        </button>

        {note ? <span className="text-small text-[var(--text-muted)]">[note]</span> : null}
        <span className="text-small text-[var(--text-muted)]">@{bucket}</span>
        <span
          className="text-small text-[var(--text-muted)] cursor-grab active:cursor-grabbing select-none px-1"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          ::
        </span>
      </div>

      {expanded && (
        <div className="px-3 pb-2 border-t border-[var(--border)] bg-[var(--bg-muted)]">
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="task note"
            className="w-full bg-[var(--bg)] text-small text-[var(--text)] p-2 resize-none h-20 border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none mt-2"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setExpanded(false)} className="btn">[esc] cancel</button>
            <button onClick={handleNoteSave} className="btn btn-primary">[enter] save</button>
          </div>
        </div>
      )}
    </div>
  );
}
