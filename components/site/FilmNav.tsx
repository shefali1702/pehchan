"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", n: "01" },
  { href: "/about", label: "About", n: "02" },
  { href: "/how-it-works", label: "How it works", n: "03" },
  { href: "/principles", label: "Principles", n: "04" },
  { href: "/demo", label: "Demo", n: "05" },
];

// The tab bar is a strip of negative film; each tab is a frame.
export default function FilmNav() {
  const path = usePathname();
  return (
    <header className="film">
      <Link href="/" className="film-brand" aria-label="Pehchan home">
        <span className="film-brand-deva">पहचान</span>
        <span className="film-brand-latin">Pehchan</span>
      </Link>
      <nav className="film-strip" aria-label="Main">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`film-frame${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
              <span className="film-n">{t.n}</span>
              <span className="film-label">{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
