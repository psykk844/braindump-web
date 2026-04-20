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
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-[var(--border-light)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-4 w-full text-left py-4 px-5 group hover:bg-[var(--bg-secondary)] transition-all"
      >
        <span className="text-2xl">{icon}</span>
        <span className="text-heading-2 text-[var(--text-primary)] flex-1">{label}</span>
        <span className="text-small text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-3 py-1 rounded-full font-medium min-w-[32px] text-center">
          {tasks.length}
        </span>
        <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors text-2xl">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div ref={setNodeRef} className="min-h-[20px] px-5 pb-4 space-y-3 bg-[var(--bg-secondary)]">
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
            <p className="text-small text-[var(--text-tertiary)] py-8 text-center">
              No tasks yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
