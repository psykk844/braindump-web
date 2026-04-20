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
    return true; // all
  });

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold mb-4">🔍 Browse</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-zinc-800">
        {[
          { key: "all", label: "All" },
          { key: "links", label: "Links" },
          { key: "ideas", label: "Ideas" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-white border-b-2 border-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">No items found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
            >
              <div className="flex items-start gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    item.type === "link"
                      ? "bg-blue-500/20 text-blue-400"
                      : item.type === "idea"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {item.type === "link" ? "🔗" : item.type === "idea" ? "💡" : "✅"}{" "}
                  {item.type}
                </span>
                {item.category !== "uncategorized" && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-400">
                    {item.category}
                  </span>
                )}
                <span className="ml-auto text-[10px] text-zinc-600">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-zinc-200 mb-2 whitespace-pre-wrap break-words">
                {item.rawText}
              </p>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline block truncate"
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
