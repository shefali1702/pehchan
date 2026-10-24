"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", tone: "marigold" },
  { href: "/about", label: "About", tone: "sindoor" },
  { href: "/how-it-works", label: "How it works", tone: "peacock" },
  { href: "/principles", label: "Principles", tone: "rani" },
  { href: "/demo", label: "Demo", tone: "neel" },
];

// The tab bar is a row of painted shop plaques.
export default function FilmNav() {
  const path = usePathname();
  return (
    <header className="sn">
      <Link href="/" className="sn-brand" aria-label="Pehchan home">
        <span className="sn-brand-deva">पहचान</span>
      </Link>
      <nav className="sn-tabs" aria-label="Main">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`sn-tab sn-${t.tone}${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
