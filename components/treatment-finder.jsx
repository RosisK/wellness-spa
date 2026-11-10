"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

function getTags(treatment) {
  return String(treatment.bestFor || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function TreatmentFinder({ treatments }) {
  const [category, setCategory] = useState("All services");
  const [search, setSearch] = useState("");
  const categories = [...new Set(treatments.map((item) => item.category))];
  const query = search.trim().toLocaleLowerCase();
  const visibleTreatments = treatments.filter((item) => {
    const inCategory = category === "All services" || item.category === category;
    const searchable = [item.name, item.category, item.description, ...getTags(item)].join(" ").toLocaleLowerCase();
    return inCategory && (!query || searchable.includes(query));
  });

  return (
    <>
      <section className="treatment-finder" aria-labelledby="treatment-finder-title">
        <div className="treatment-finder-heading">
          <div>
            <p className="eyebrow">Treatments and prices</p>
            <h2 id="treatment-finder-title">Browse the menu</h2>
          </div>
          <label className="treatment-search">Search the menu<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try massage, facial, feet…" /></label>
        </div>
        <div className="treatment-filter-list" aria-label="Treatment categories">
          {["All services", ...categories].map((item) => (
            <button type="button" key={item} className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span>{item === "All services" ? treatments.length : treatments.filter((treatment) => treatment.category === item).length}</span></button>
          ))}
        </div>
      </section>

      <section className="treatment-results" aria-live="polite" aria-label="Treatments">
        <p className="treatment-result-count">{visibleTreatments.length} {visibleTreatments.length === 1 ? "service" : "services"}</p>
        {visibleTreatments.map((item) => (
          <article className="treatment-service-card" key={item.id}>
            <div className="treatment-service-main">
              <div>
                <p className="eyebrow">{item.category}</p>
                <h2>{item.name}</h2>
                <p className="muted">{item.description}</p>
                {!!getTags(item).length && <ul className="treatment-tags" aria-label="Treatment focus">{getTags(item).map((tag) => <li key={tag}>{tag}</li>)}</ul>}
              </div>
              <div className="treatment-service-action">
                <span>From</span>
                <strong>{item.options[0]?.price}</strong>
                <Link className="button button-dark" href={`/book?treatment=${item.id}&option=${item.options[0]?.id}`}>Request <ArrowUpRight size={14} /></Link>
              </div>
            </div>
            {item.options.length > 1 && (
              <details className="treatment-service-options">
                <summary>View all {item.options.length} options and prices</summary>
                <ul>
                  {item.options.map((option) => (
                    <li key={option.id}>
                      <span>{option.label}</span><strong>{option.price}</strong>
                      <Link href={`/book?treatment=${item.id}&option=${option.id}`}>Choose this option <ArrowUpRight size={13} /></Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
        {visibleTreatments.length === 0 && <p className="treatment-empty">No services match that search. Try another word or choose a different category.</p>}
      </section>
    </>
  );
}
