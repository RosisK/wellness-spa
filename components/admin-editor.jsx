"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { defaultSiteContent, getOptionPrice, normalizeTreatment } from "../lib/site-content";
import AdminImageField from "./admin-image-field";
import BookingInbox from "./booking-inbox";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const projectRoot = projectUrl?.replace(/\/$/, "");
const apiBase = projectRoot ? `${projectRoot}/rest/v1` : "";

async function readContent(token) {
  const response = await fetch(`${apiBase}/site_content?id=eq.1&select=content`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load site content. Check the database setup.");
  const [row] = await response.json();
  if (!row?.content) throw new Error("The site content record is missing. Check that the database migration has been applied.");
  const menuNeedsRefresh = Number(row.content.menuVersion || 0) < defaultSiteContent.menuVersion;
  return {
    ...defaultSiteContent,
    ...row.content,
    menuVersion: defaultSiteContent.menuVersion,
    hours: menuNeedsRefresh ? defaultSiteContent.hours : row.content.hours || defaultSiteContent.hours,
    locations: menuNeedsRefresh ? defaultSiteContent.locations : row.content.locations,
    treatments: menuNeedsRefresh
      ? defaultSiteContent.treatments
      : (Array.isArray(row.content.treatments) ? row.content.treatments : defaultSiteContent.treatments).map(normalizeTreatment),
    images: { ...defaultSiteContent.images, ...(row.content.images || {}) },
  };
}

async function removeStorageObjects(token, paths) {
  const response = await fetch(`${projectRoot}/storage/v1/object/waves-spa-images`, {
    method: "DELETE",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!response.ok) throw new Error("The site was saved, but some replaced images could not be removed from storage.");
}

export default function AdminEditor() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const [activeView, setActiveView] = useState("content");
  const [activeSection, setActiveSection] = useState("contact");
  const [treatmentSearch, setTreatmentSearch] = useState("");

  if (!projectUrl || !anonKey) {
    return (
      <div className="admin-message">
        <h2>Database setup required</h2>
        <p>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and a publishable or anon key to your local environment and hosting settings, then run the SQL migration described in the README.</p>
      </div>
    );
  }

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`${projectRoot}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || result.message || "Sign-in failed.");
      if (result.user?.app_metadata?.role !== "admin") {
        throw new Error("This account does not have the Waves Spa admin role.");
      }

      const loadedContent = await readContent(result.access_token);
      setToken(result.access_token);
      setContent(loadedContent);
      setPassword("");
    } catch (issue) {
      setError(issue.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  function updateSetting(field, value) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  function changeImage(field, image) {
    const previousImage = content.images?.[field];
    if (previousImage?.path && previousImage.path !== image?.path) {
      setPendingDeletes((paths) => [...new Set([...paths, previousImage.path])]);
    }
    setContent((current) => ({
      ...current,
      images: { ...current.images, [field]: image },
    }));
  }

  async function uploadImage(field, file) {
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    if (!extension) throw new Error("Choose a JPG, PNG, or WebP image.");
    const path = `${field}/${crypto.randomUUID()}.${extension}`;
    setUploadsInProgress((count) => count + 1);
    try {
      const response = await fetch(`${projectRoot}/storage/v1/object/waves-spa-images/${path}`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": file.type,
          "Cache-Control": "3600",
        },
        body: file,
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || result.error || "The image could not be uploaded.");
      }
      const url = `${projectRoot}/storage/v1/object/public/waves-spa-images/${path}`;
      changeImage(field, { url, path });
    } finally {
      setUploadsInProgress((count) => count - 1);
    }
  }

  function updateItem(collection, index, field, value) {
    setContent((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function updateTreatmentOption(index, optionIndex, field, value) {
    setContent((current) => ({
      ...current,
      treatments: current.treatments.map((treatment, treatmentIndex) => treatmentIndex !== index ? treatment : ({
        ...treatment,
        options: treatment.options.map((option, itemIndex) => itemIndex === optionIndex ? { ...option, [field]: value } : option),
      })),
    }));
  }

  function addTreatmentOption(index) {
    const option = { id: crypto.randomUUID(), label: "New option", duration: "", price: "", discountPercent: "" };
    setContent((current) => ({
      ...current,
      treatments: current.treatments.map((treatment, itemIndex) => itemIndex === index
        ? { ...treatment, options: [...treatment.options, option] }
        : treatment),
    }));
  }

  function removeTreatmentOption(index, optionIndex) {
    setContent((current) => ({
      ...current,
      treatments: current.treatments.map((treatment, itemIndex) => itemIndex === index
        ? { ...treatment, options: treatment.options.filter((_, currentIndex) => currentIndex !== optionIndex) }
        : treatment),
    }));
  }

  function addItem(collection, treatmentCategory) {
    const id = crypto.randomUUID();
    let categoryName = treatmentCategory || "Massage & Body Therapies";
    if (collection === "treatments" && categoryName === "New category") {
      let suffix = 1;
      while (content.treatments.some((treatment) => treatment.category === (suffix === 1 ? categoryName : `${categoryName} ${suffix}`))) suffix += 1;
      if (suffix > 1) categoryName = `${categoryName} ${suffix}`;
    }
    const item = collection === "locations"
      ? { id, name: "New location", address: "", city: "", region: "", country: "Nepal", mapUrl: "" }
      : { id, name: "New treatment", category: categoryName, description: "", bestFor: "", options: [{ id: crypto.randomUUID(), label: "60 min", duration: "60 min", price: "", discountPercent: "" }], featured: false };
    setContent((current) => ({ ...current, [collection]: [...current[collection], item] }));
    if (collection === "treatments") setTreatmentSearch("");
    setError("");
    setNotice(`New ${collection === "locations" ? "location" : "treatment"} added. Complete its details, then save your changes.`);
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-admin-item="${id}"]`);
      const category = card?.closest(".admin-category-group");
      if (category) category.open = true;
      if (card instanceof HTMLDetailsElement) card.open = true;
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
      card?.querySelector("input")?.focus({ preventScroll: true });
    });
  }

  function removeItem(collection, index) {
    setContent((current) => ({
      ...current,
      [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function save(event) {
    event.preventDefault();
    const invalidLocation = content.locations.some((location) =>
      ["name", "address", "city", "region", "country", "mapUrl"].some((field) => !String(location[field] || "").trim()),
    );
    const invalidTreatment = content.treatments.some((treatment) =>
      ["name", "category", "description"].some((field) => !String(treatment[field] || "").trim())
      || !Array.isArray(treatment.options) || treatment.options.length === 0
      || treatment.options.some((option) => !String(option.label || "").trim() || !String(option.price || "").trim()
        || (option.discountPercent !== "" && option.discountPercent != null
          && (!Number.isFinite(Number(option.discountPercent)) || Number(option.discountPercent) < 1 || Number(option.discountPercent) > 99))),
    );
    if (!content.phone?.trim() || !content.whatsapp?.trim() || !content.hours?.trim()
      || invalidLocation || invalidTreatment) {
      const section = invalidTreatment ? "treatments" : invalidLocation ? "locations" : "contact";
      setActiveSection(section);
      setError("Complete the required fields before saving.");
      setNotice("");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${apiBase}/site_content?id=eq.1`, {
        method: "PATCH",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Save failed. Check the database policies and try again.");
      }
      const updatedRows = await response.json();
      if (!updatedRows.length) throw new Error("No content record was updated. Check that the initial site content record exists.");
      let cleanupMessage = "";
      if (pendingDeletes.length) {
        try {
          await removeStorageObjects(token, pendingDeletes);
          setPendingDeletes([]);
        } catch {
          cleanupMessage = " Some replaced images could not be removed from storage.";
        }
      }
      setNotice(`Changes saved. They’re now visible on the public site.${cleanupMessage}`);
      router.refresh();
    } catch (issue) {
      setError(issue.message || "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  if (!content) {
    return (
      <form className="admin-login" onSubmit={signIn}>
        <h2>Admin sign-in</h2>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="button button-dark" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    );
  }

  const query = treatmentSearch.trim().toLocaleLowerCase();
  const treatmentsByCategory = [...new Set(content.treatments.map((treatment) => treatment.category))]
    .map((category) => ({
      category,
      items: content.treatments.map((item, index) => ({ item, index })).filter(({ item }) => {
        if (item.category !== category || !query) return item.category === category;
        return [item.name, item.category, item.description, item.bestFor, ...item.options.flatMap((option) => [option.label, option.price, option.discountPercent])]
          .join(" ").toLocaleLowerCase().includes(query);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="admin-workspace">
      <nav className="admin-main-tabs" aria-label="Admin areas">
        <button type="button" className={activeView === "content" ? "active" : ""} onClick={() => setActiveView("content")}>Website content</button>
        <button type="button" className={activeView === "bookings" ? "active" : ""} onClick={() => setActiveView("bookings")}>Booking requests</button>
        <button type="button" className="admin-sign-out" onClick={() => { setContent(null); setToken(""); setNotice(""); }}>Sign out</button>
      </nav>

      {activeView === "bookings"
        ? <BookingInbox token={token} />
        : <form className="admin-editor" onSubmit={save} noValidate>
      <nav className="admin-subnav" aria-label="Website content sections">
        {[["contact", "Contact"], ["treatments", "Treatments"], ["locations", "Locations"], ["images", "Images"], ["reviews", "Reviews"]].map(([section, label]) => (
          <button type="button" key={section} className={activeSection === section ? "active" : ""} onClick={() => setActiveSection(section)}>{label}</button>
        ))}
      </nav>

      <section className="admin-section" hidden={activeSection !== "reviews"}>
        <div className="admin-section-heading"><div><p className="eyebrow">Reviews</p><h2>Guest reviews</h2></div></div>
        <div className="admin-fields">
          <label className="admin-checkbox"><input type="checkbox" checked={content.showReviews !== false} onChange={(event) => updateSetting("showReviews", event.target.checked)} /> Show guest reviews on the home page</label>
        </div>
      </section>

      <section className="admin-section" hidden={activeSection !== "images"}>
        <div className="admin-section-heading"><div><p className="eyebrow">Images</p><h2>Photos on the website</h2></div></div>
        <div className="admin-image-grid">
          {[["hero", "Home page"], ["story", "Home page visit section"], ["about", "About page"]].map(([field, label]) => (
            <AdminImageField
              key={field}
              label={label}
              image={content.images?.[field]}
              onUpload={(file) => uploadImage(field, file)}
              onRemove={() => changeImage(field, null)}
            />
          ))}
        </div>
      </section>

      <section className="admin-section" hidden={activeSection !== "contact"}>
        <div className="admin-section-heading"><div><p className="eyebrow">Contact</p><h2>Phone and hours</h2></div></div>
        <div className="admin-fields">
          <label>Phone<input value={content.phone} onChange={(event) => updateSetting("phone", event.target.value)} required /></label>
          <label>WhatsApp<input value={content.whatsapp} onChange={(event) => updateSetting("whatsapp", event.target.value)} required /></label>
          <label className="wide-field">Opening hours<input value={content.hours} onChange={(event) => updateSetting("hours", event.target.value)} required /></label>
        </div>
      </section>

      <section className="admin-section" hidden={activeSection !== "locations"}>
        <div className="admin-section-heading">
          <div><p className="eyebrow">Locations</p><h2>Addresses and map links</h2></div>
          <button type="button" className="text-link admin-add" onClick={() => addItem("locations")}>Add location +</button>
        </div>
        {content.locations.map((location, index) => (
          <fieldset className="admin-card" key={location.id} data-admin-item={location.id}>
            <legend>Location {index + 1}</legend>
            <button type="button" className="admin-remove" onClick={() => removeItem("locations", index)} disabled={content.locations.length === 1}>Remove</button>
            <div className="admin-fields">
              {[["name", "Location name"], ["address", "Street / area"], ["city", "City"], ["region", "Province / region"], ["country", "Country"], ["mapUrl", "Google Maps link"]].map(([field, label]) => (
                <label key={field}>{label}<input value={location[field] || ""} onChange={(event) => updateItem("locations", index, field, event.target.value)} required /></label>
              ))}
            </div>
          </fieldset>
        ))}
        <button type="button" className="text-link admin-add" onClick={() => addItem("locations")}>Add another location +</button>
      </section>

      <section className="admin-section" hidden={activeSection !== "treatments"}>
        <div className="admin-section-heading">
          <div><p className="eyebrow">Treatments</p><h2>{content.treatments.length} services and packages</h2></div>
          <button type="button" className="text-link admin-add" onClick={() => addItem("treatments", "New category")}>Add category +</button>
        </div>
        <p className="admin-treatment-help">Choose a category to browse, or search for a service. Open a service to edit it; use Add treatment inside a category to add to that group. Add category starts a new group with a treatment you can edit.</p>
        <label className="admin-treatment-search">Search services<input type="search" value={treatmentSearch} onChange={(event) => setTreatmentSearch(event.target.value)} placeholder="Name, category, price, or option" /></label>
        <div className="admin-treatment-groups">
          {treatmentsByCategory.map(({ category, items }, groupIndex) => (
            <details className="admin-category-group" key={category} name="treatment-categories" open={groupIndex === 0}>
              <summary><span>{category}</span><small>{items.length} {items.length === 1 ? "service" : "services"}</small></summary>
              <div className="admin-category-toolbar">
                <button type="button" className="text-link admin-add" aria-label={`Add treatment to ${category}`} onClick={() => addItem("treatments", category)}>Add treatment +</button>
              </div>
              <div className="admin-category-items">
                {items.map(({ item: treatment, index }) => (
                  <details className="admin-service-editor" key={treatment.id} data-admin-item={treatment.id}>
                    <summary>
                      <span><strong>{treatment.name}</strong><small>{treatment.options.length} {treatment.options.length === 1 ? "option" : "options"} · from {getOptionPrice(treatment.options[0]).price}</small></span>
                    </summary>
                    <div className="admin-service-toolbar">
                      <span>Service details</span>
                      <button type="button" className="admin-service-remove" onClick={() => removeItem("treatments", index)} disabled={content.treatments.length === 1}>Remove service</button>
                    </div>
                    <div className="admin-fields">
                      <label>Name<input value={treatment.name} onChange={(event) => updateItem("treatments", index, "name", event.target.value)} required /></label>
                      <label>Category<input value={treatment.category} onChange={(event) => updateItem("treatments", index, "category", event.target.value)} required /></label>
                      <label>Description<input value={treatment.description} onChange={(event) => updateItem("treatments", index, "description", event.target.value)} required /></label>
                      <label>Good for <span className="optional">Separate tags with commas</span><input value={treatment.bestFor || ""} onChange={(event) => updateItem("treatments", index, "bestFor", event.target.value)} placeholder="e.g. Full body, Warm oil" /></label>
                      <label className="admin-checkbox"><input type="checkbox" checked={Boolean(treatment.featured)} onChange={(event) => updateItem("treatments", index, "featured", event.target.checked)} /> Feature on home page</label>
                    </div>
                    <div className="admin-treatment-options">
                      <div className="admin-option-heading"><strong>Options and prices</strong><span>Set an optional discount for each option; the reduced price is calculated automatically.</span></div>
                      {treatment.options.map((option, optionIndex) => (
                        <div className="admin-option-row" key={option.id}>
                          <label>Option<input value={option.label} onChange={(event) => updateTreatmentOption(index, optionIndex, "label", event.target.value)} placeholder="60 min or Full body" required /></label>
                          <label>Duration <span className="optional">Optional</span><input value={option.duration || ""} onChange={(event) => updateTreatmentOption(index, optionIndex, "duration", event.target.value)} placeholder="60 min" /></label>
                          <label>Price<input value={option.price} onChange={(event) => updateTreatmentOption(index, optionIndex, "price", event.target.value)} placeholder="NPR 3,500" required /></label>
                          <label>Discount <span className="optional">Optional, 1–99%</span><input type="number" min="1" max="99" step="1" value={option.discountPercent ?? ""} onChange={(event) => updateTreatmentOption(index, optionIndex, "discountPercent", event.target.value)} placeholder="%" /></label>
                          <button type="button" className="admin-remove-option" onClick={() => removeTreatmentOption(index, optionIndex)} disabled={treatment.options.length === 1}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className="text-link admin-add" onClick={() => addTreatmentOption(index)}>Add price option +</button>
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
          {!treatmentsByCategory.length && <p className="booking-inbox-empty">No services match this search.</p>}
        </div>
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      <div className="admin-save-bar">
        <button className="button button-dark" disabled={busy || uploadsInProgress > 0}>{uploadsInProgress ? "Uploading…" : busy ? "Saving…" : "Save changes"}</button>
      </div>
    </form>}
    </div>
  );
}
