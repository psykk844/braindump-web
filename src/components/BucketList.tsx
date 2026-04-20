"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  note: string;
  bucket: string;
  order: number;
}

interface BucketListProps {
  bucket: string;
  label: string;
  icon: string;
  tasks: Task[];
  defaultExpanded?: boolean;
  onComplete: (id: number) => void;
  onUpdateNote: (id: number, note: string) => void;
}

export default function BucketList({
  bucket,
  label,
  icon,
  tasks,
  defaultExpanded = false,
  onComplete,
  onUpdateNote,
}: BucketListProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { setNodeRef } = useDroppable({ id: bucket });

  return (
    <section className="section mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left px-3 py-2 border-b border-[var(--border)]"
      >
        <span className="text-small text-[var(--text-dim)]">{icon}</span>
        <span className="text-heading text-[var(--text)] lowercase flex-1">
          {label}
        </span>
        <span className="text-small text-[var(--text-muted)]">({tasks.length})</span>
        <span className="text-small text-[var(--text-dim)]">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div ref={setNodeRef}>
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                note={task.note}
                bucket={task.bucket}
                onComplete={onComplete}
                onUpdateNote={onUpdateNote}
              />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <p className="text-small text-[var(--text-muted)] py-3 px-3">empty</p>
          )}
        </div>
      )}
    </section>
  );
}
