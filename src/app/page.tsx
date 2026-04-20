"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import BucketList from "@/components/BucketList";
import AddTaskDialog from "@/components/AddTaskDialog";
import { apiFetch } from "@/lib/api-client";

interface Task {
  id: number;
  title: string;
  note: string;
  bucket: string;
  order: number;
  itemId: number | null;
  createdAt: string;
  completedAt: string | null;
}

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const fetchTasks = useCallback(async () => {
    const res = await apiFetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }, []);

  useEffect(() => {
    fetchTasks();
    const es = new EventSource("/api/events");
    es.addEventListener("task-updated", () => fetchTasks());
    es.addEventListener("tasks-reordered", () => fetchTasks());
    es.addEventListener("new-item", () => fetchTasks());
    return () => es.close();
  }, [fetchTasks]);

  function bucketTasks(bucket: string) {
    return tasks
      .filter((t) => t.bucket === bucket)
      .sort((a, b) => a.order - b.order);
  }

  async function handleComplete(id: number) {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, bucket: "done" } : t)));
    await apiFetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    fetchTasks();
  }

  async function handleUpdateNote(id: number, note: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, note } : t)));
    await apiFetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find which bucket the task is in
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const bucket = task.bucket;
    const bucketItems = bucketTasks(bucket);
    const oldIndex = bucketItems.findIndex((t) => t.id === active.id);
    const newIndex = bucketItems.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      // Cross-bucket drop — check if over.id is a bucket ID
      const targetBucket = String(over.id);
      if (["top5", "next", "later"].includes(targetBucket)) {
        await apiFetch(`/api/tasks/${active.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bucket: targetBucket }),
        });
        fetchTasks();
      }
      return;
    }

    const reordered = arrayMove(bucketItems, oldIndex, newIndex);
    const reorderedIds = reordered.map((t) => t.id);

    // Optimistic
    const newTasks = tasks.map((t) => {
      const idx = reorderedIds.indexOf(t.id);
      if (idx !== -1) return { ...t, order: idx + 1 };
      return t;
    });
    setTasks(newTasks);

    await apiFetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, taskIds: reorderedIds }),
    });
  }

  async function handleAddTask(title: string, bucket: string) {
    await apiFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, bucket }),
    });
    fetchTasks();
    setShowAdd(false);
  }

  return (
    <div className="pt-8 pb-4">
      <div className="mb-8">
        <h1 className="text-heading-2 text-[var(--text-primary)] mb-1">Board</h1>
        <p className="text-caption text-[var(--text-tertiary)]">
          Focus on what matters most
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <BucketList
          bucket="top5"
          label="Top 5"
          icon="●"
          tasks={bucketTasks("top5")}
          defaultExpanded={true}
          onComplete={handleComplete}
          onUpdateNote={handleUpdateNote}
        />
        <BucketList
          bucket="next"
          label="Next"
          icon="○"
          tasks={bucketTasks("next")}
          defaultExpanded={false}
          onComplete={handleComplete}
          onUpdateNote={handleUpdateNote}
        />
        <BucketList
          bucket="later"
          label="Later"
          icon="◌"
          tasks={bucketTasks("later")}
          defaultExpanded={false}
          onComplete={handleComplete}
          onUpdateNote={handleUpdateNote}
        />
      </DndContext>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[var(--accent-violet)] hover:bg-[var(--accent-hover)] text-white text-xl font-medium shadow-lg transition-all duration-150 z-40 flex items-center justify-center"
        aria-label="Add task"
      >
        +
      </button>

      {showAdd && (
        <AddTaskDialog
          onAdd={handleAddTask}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
