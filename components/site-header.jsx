"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Waves, X } from "lucide-react";

const links = [
  ["Home", "/"],
  ["Treatments", "/treatments"],
  ["About", "/about"],
  ["Visit", "/visit"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="topline">
        <span>Lakeside 6 · Pokhara</span>
        <span>Open daily, 9:00–20:00</span>
        <a href="tel:+9779846021840">+977 984 602 1840</a>
      </div>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Waves Spa home">
          <span className="brand-mark"><Waves size={20} /></span>
          <span>Waves <i>Spa</i></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <Link className="button button-dark header-cta" href="/book">
          Book a visit <span>↗</span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link href="/book" onClick={() => setOpen(false)}>Book a visit ↗</Link>
        </nav>
      )}
    </>
  );
}
