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
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full text-left py-2 group"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-body-medium text-[var(--text-primary)]">{label}</span>
        <span className="text-label text-[var(--text-quaternary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
        <span className="ml-auto text-[var(--text-quaternary)] group-hover:text-[var(--text-tertiary)] transition-colors text-xs">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div ref={setNodeRef} className="min-h-[20px] mt-2">
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
            <p className="text-caption text-[var(--text-quaternary)] py-6 text-center">
              No tasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}
