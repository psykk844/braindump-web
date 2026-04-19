"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/", label: "Board", icon: "✅", activeIcon: "✅" },
  { href: "/inbox", label: "Inbox", icon: "📥", activeIcon: "📥" },
  { href: "/browse", label: "Browse", icon: "🔍", activeIcon: "🔍" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    fetch("/api/items?processed=false")
      .then((r) => r.json())
      .then((data) => setInboxCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});

    // Listen for SSE updates
    const es = new EventSource("/api/events");
    es.addEventListener("new-item", () => {
      setInboxCount((c) => c + 1);
    });
    return () => es.close();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? "text-white" : "text-zinc-500"
              }`}
            >
              <span className="text-xl relative">
                {tab.icon}
                {tab.label === "Inbox" && inboxCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {inboxCount > 99 ? "99+" : inboxCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
