"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const tabs = [
  { href: "/", label: "Board", icon: "✓" },
  { href: "/inbox", label: "Inbox", icon: "↓" },
  { href: "/browse", label: "Browse", icon: "◎" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    apiFetch("/api/items?processed=false")
      .then((r) => r.json())
      .then((data) => setInboxCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});

    const es = new EventSource("/api/events");
    es.addEventListener("new-item", () => {
      setInboxCount((c) => c + 1);
    });
    return () => es.close();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const unreadCount = tab.label === "Inbox" ? inboxCount : 0;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-150 ${
                isActive 
                  ? "text-[var(--accent-primary)]" 
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-xl mb-1 relative">
                {tab.icon}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[var(--accent-primary)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </span>
              <span className="text-caption font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
