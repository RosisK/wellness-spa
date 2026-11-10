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
  const [selectedTag, setSelectedTag] = useState("");
  const tags = [...new Set(treatments.flatMap(getTags))];
  const visibleTreatments = selectedTag
    ? treatments.filter((treatment) => getTags(treatment).some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()))
    : treatments;

  return (
    <>
      <section className="treatment-finder" aria-labelledby="treatment-finder-title">
        <div className="treatment-finder-heading">
          <div>
            <p className="eyebrow">Find a treatment</p>
            <h2 id="treatment-finder-title">What are you looking for?</h2>
          </div>
          <p>Choose an area of focus to narrow the list. You can add preferences when you request an appointment.</p>
        </div>
        <div className="treatment-filter-list" aria-label="Filter treatments by focus">
          <button type="button" className={!selectedTag ? "active" : ""} aria-pressed={!selectedTag} onClick={() => setSelectedTag("")}>All treatments</button>
          {tags.map((tag) => (
            <button type="button" key={tag} className={selectedTag === tag ? "active" : ""} aria-pressed={selectedTag === tag} onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}>{tag}</button>
          ))}
        </div>
      </section>

      <section className="catalog" aria-live="polite" aria-label="Treatments">
        <p className="treatment-result-count">{visibleTreatments.length} {visibleTreatments.length === 1 ? "treatment" : "treatments"}</p>
        {visibleTreatments.map((item, index) => (
          <article className="catalog-card" key={item.id}>
            <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="eyebrow">{item.category}</p>
              <h2>{item.name}</h2>
              <p className="muted">{item.description}</p>
              {!!getTags(item).length && <ul className="treatment-tags" aria-label="Treatment focus">{getTags(item).map((tag) => <li key={tag}>{tag}</li>)}</ul>}
            </div>
            <div className="catalog-action">
              <span className="treatment-price-heading">Options and prices</span>
              <ul className="treatment-option-list">
                {item.options.map((option) => (
                  <li key={option.id}>
                    <span>{option.label}</span>
                    <strong>{option.price}</strong>
                    <Link href={`/book?treatment=${item.id}&option=${option.id}`} aria-label={`Request ${item.name}, ${option.label}`}>Choose <ArrowUpRight size={13} /></Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        {visibleTreatments.length === 0 && <p className="treatment-empty">No treatments are tagged for this focus yet. View all treatments or contact us for help choosing.</p>}
      </section>
    </>
  );
}
