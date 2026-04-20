"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

interface Item {
  id: number;
  rawText: string;
  type: "link" | "idea" | "todo";
  url: string | null;
  category: string;
  processed: number;
  createdAt: string;
}

type TabType = "all" | "links" | "ideas";

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  async function fetchItems() {
    const res = await apiFetch("/api/items");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeTab === "links") return item.type === "link";
    if (activeTab === "ideas") return item.type === "idea";
    return true;
  });

  return (
    <div className="pt-8 pb-4">
      <div className="mb-8">
        <h1 className="text-heading-2 text-[var(--text-primary)] mb-1">Browse</h1>
        <p className="text-caption text-[var(--text-tertiary)]">
          Explore your captured ideas and links
        </p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[var(--border-subtle)]">
        {[
          { key: "all", label: "All" },
          { key: "links", label: "Links" },
          { key: "ideas", label: "Ideas" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 text-small-medium transition-all duration-150 relative ${
              activeTab === tab.key
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-violet)]" />
            )}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-small-medium text-[var(--text-quaternary)]">No items found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="card-linear p-4"
            >
              <div className="flex items-start gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded-[var(--radius-sm)] text-label border ${
                    item.type === "link"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : item.type === "idea"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-[var(--status-green)]/10 text-[var(--status-green)] border-[var(--status-green)]/20"
                  }`}
                >
                  {item.type}
                </span>
                {item.category !== "uncategorized" && (
                  <span className="px-2 py-1 rounded-[var(--radius-sm)] text-label bg-[var(--bg-surface)] text-[var(--text-quaternary)] border border-[var(--border-subtle)]">
                    {item.category}
                  </span>
                )}
                <span className="ml-auto text-label text-[var(--text-quaternary)]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-small-medium text-[var(--text-primary)] mb-2 whitespace-pre-wrap break-words leading-relaxed">
                {item.rawText}
              </p>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption text-[var(--accent-violet)] hover:text-[var(--accent-hover)] block truncate transition-colors"
                >
                  {item.url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
