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
    if (title.trim()) onAdd(title.trim(), bucket);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
        <h2 className="text-heading text-[var(--text)] mb-3">[a] add task</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="task title"
            className="w-full bg-[var(--bg)] border border-[var(--border)] px-2 py-2 text-body text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />

          <div className="flex gap-2 flex-wrap">
            {[
              { key: "top5", label: "● top 5" },
              { key: "next", label: "○ next" },
              { key: "later", label: "◌ later" },
            ].map((b) => (
              <button
                type="button"
                key={b.key}
                onClick={() => setBucket(b.key)}
                className={`btn ${bucket === b.key ? "btn-primary" : ""}`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn">
              [esc] cancel
            </button>
            <button type="submit" className="btn btn-primary">
              [enter] add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
