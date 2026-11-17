"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Waves, X } from "lucide-react";
import { telephoneHref } from "../lib/site-content";

const links = [
  ["Home", "/"],
  ["Treatments", "/treatments"],
  ["About", "/about"],
  ["Visit", "/visit"],
];

export default function SiteHeader({ content }) {
  const [open, setOpen] = useState(false);
  const location = content.locations[0];

  return (
    <>
      <div className="topline">
        <span>{location.address} · {location.city}</span>
        <span>{content.hours}</span>
        <a href={telephoneHref(content.phone)}>{content.phone}</a>
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
