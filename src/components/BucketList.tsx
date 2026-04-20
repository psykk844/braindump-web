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
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <span className="text-body">{icon}</span>
        <span className="text-heading text-[var(--text-primary)] flex-1">{label}</span>
        <span className="text-tiny text-[var(--text-muted)]">({tasks.length})</span>
        <span className="text-tiny text-[var(--text-tertiary)]">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div ref={setNodeRef} className="border-t border-[var(--border)]">
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
            <p className="text-small text-[var(--text-muted)] py-4 px-3 text-center">
              No tasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}
