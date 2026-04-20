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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
      <div className="bg-[var(--bg-panel)] rounded-t-2xl sm:rounded-xl w-full max-w-lg p-6 border border-[var(--border-standard)] animate-in slide-in-from-bottom duration-200 sm:slide-in-from-bottom-0">
        <h2 className="text-heading-3 text-[var(--text-primary)] mb-4">Add Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-standard)] rounded-[var(--radius-sm)] p-3 text-small-medium text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus:border-[var(--border-secondary)] focus:outline-none mb-4 transition-colors"
          />
          <div className="flex gap-2 mb-4">
            {[
              { key: "top5", label: "Top 5", icon: "●" },
              { key: "next", label: "Next", icon: "○" },
              { key: "later", label: "Later", icon: "◌" },
            ].map((b) => (
              <button
                type="button"
                key={b.key}
                onClick={() => setBucket(b.key)}
                className={`flex-1 px-3 py-2 rounded-[var(--radius-sm)] text-label transition-all duration-150 ${
                  bucket === b.key
                    ? "bg-[var(--accent-violet)] text-white"
                    : "btn-ghost"
                }`}
              >
                <span className="mr-1">{b.icon}</span>
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 btn-ghost text-small-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 btn-primary text-small-medium"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
