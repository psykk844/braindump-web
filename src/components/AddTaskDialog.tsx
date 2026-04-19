"use client";

import { useState } from "react";

interface AddTaskDialogProps {
  onAdd: (title: string, bucket: string) => void;
  onClose: () => void;
}

export default function AddTaskDialog({ onAdd, onClose }: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState("later");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), bucket);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Add Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:border-zinc-500 focus:outline-none mb-3"
          />
          <div className="flex gap-2 mb-4">
            {[
              { key: "top5", label: "🔥 Top 5" },
              { key: "next", label: "⏳ Next" },
              { key: "later", label: "🧊 Later" },
            ].map((b) => (
              <button
                type="button"
                key={b.key}
                onClick={() => setBucket(b.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  bucket === b.key
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-sm text-zinc-400 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
