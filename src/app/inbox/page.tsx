"use client";

import { useEffect, useState } from "react";
import InboxCard from "@/components/InboxCard";
import { addTask } from "@/lib/tasks";

interface Item {
  id: number;
  rawText: string;
  type: "link" | "idea" | "todo";
  url: string | null;
  category: string;
  processed: number;
  createdAt: string;
}

export default function InboxPage() {
  const [items, setItems] = useState<Item[]>([]);

  async function fetchItems() {
    const res = await fetch("/api/items?processed=false");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    fetchItems();
    const es = new EventSource("/api/events");
    es.addEventListener("new-item", () => fetchItems());
    return () => es.close();
  }, []);

  async function handlePromoteToTask(id: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Create task
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.rawText, bucket: "later" }),
    });

    // Mark as processed
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processed: true }),
    });

    fetchItems();
  }

  async function handleArchive(id: number) {
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processed: true }),
    });
    fetchItems();
  }

  async function handleReclassify(id: number, type: string) {
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    fetchItems();
  }

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold mb-4">📥 Inbox</h1>
      <p className="text-sm text-zinc-500 mb-4">
        Swipe right to create task • Swipe left to archive
      </p>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">No items in inbox</p>
          <p className="text-zinc-700 text-xs mt-2">
            Send a message to your Telegram bot to capture ideas
          </p>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <InboxCard
              key={item.id}
              id={item.id}
              rawText={item.rawText}
              type={item.type}
              url={item.url}
              category={item.category}
              onPromoteToTask={handlePromoteToTask}
              onArchive={handleArchive}
              onReclassify={handleReclassify}
            />
          ))}
        </div>
      )}
    </div>
  );
}
