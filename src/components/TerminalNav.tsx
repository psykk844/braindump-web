"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "[b] board" },
  { href: "/inbox", label: "[i] inbox" },
  { href: "/browse", label: "[v] browse" },
];

export default function TerminalNav() {
  const pathname = usePathname();

  return (
    <nav className="terminal-shell pt-3 pb-0">
      <div className="terminal-command-row">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`terminal-command ${active ? "active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
