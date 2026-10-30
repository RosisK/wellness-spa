"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { defaultSiteContent } from "../lib/site-content";
import AdminImageField from "./admin-image-field";

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
  return {
    ...defaultSiteContent,
    ...row.content,
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

  function addItem(collection) {
    const id = crypto.randomUUID();
    const item = collection === "locations"
      ? { id, name: "New location", address: "", city: "", region: "", country: "Nepal", mapUrl: "" }
      : { id, name: "New treatment", category: "Massage", description: "", duration: "60 min", price: "", featured: false };
    setContent((current) => ({ ...current, [collection]: [...current[collection], item] }));
  }

  function removeItem(collection, index) {
    setContent((current) => ({
      ...current,
      [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function save(event) {
    event.preventDefault();
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

  return (
    <form className="admin-editor" onSubmit={save}>
      <section className="admin-section">
        <div className="admin-section-heading"><div><p className="eyebrow">Reviews</p><h2>Guest reviews</h2></div></div>
        <div className="admin-fields">
          <label className="admin-checkbox"><input type="checkbox" checked={content.showReviews !== false} onChange={(event) => updateSetting("showReviews", event.target.checked)} /> Show guest reviews on the home page</label>
        </div>
      </section>

      <section className="admin-section">
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

      <section className="admin-section">
        <div className="admin-section-heading"><div><p className="eyebrow">Contact</p><h2>Phone and hours</h2></div></div>
        <div className="admin-fields">
          <label>Phone<input value={content.phone} onChange={(event) => updateSetting("phone", event.target.value)} required /></label>
          <label>WhatsApp<input value={content.whatsapp} onChange={(event) => updateSetting("whatsapp", event.target.value)} required /></label>
          <label className="wide-field">Opening hours<input value={content.hours} onChange={(event) => updateSetting("hours", event.target.value)} required /></label>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div><p className="eyebrow">Locations</p><h2>Addresses and map links</h2></div>
          <button type="button" className="text-link admin-add" onClick={() => addItem("locations")}>Add location +</button>
        </div>
        {content.locations.map((location, index) => (
          <fieldset className="admin-card" key={location.id}>
            <legend>Location {index + 1}</legend>
            <button type="button" className="admin-remove" onClick={() => removeItem("locations", index)} disabled={content.locations.length === 1}>Remove</button>
            <div className="admin-fields">
              {[["name", "Location name"], ["address", "Street / area"], ["city", "City"], ["region", "Province / region"], ["country", "Country"], ["mapUrl", "Google Maps link"]].map(([field, label]) => (
                <label key={field}>{label}<input value={location[field] || ""} onChange={(event) => updateItem("locations", index, field, event.target.value)} required /></label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div><p className="eyebrow">Treatments</p><h2>Services and prices</h2></div>
          <button type="button" className="text-link admin-add" onClick={() => addItem("treatments")}>Add treatment +</button>
        </div>
        {content.treatments.map((treatment, index) => (
          <fieldset className="admin-card" key={treatment.id}>
            <legend>Treatment {index + 1}</legend>
            <button type="button" className="admin-remove" onClick={() => removeItem("treatments", index)} disabled={content.treatments.length === 1}>Remove</button>
            <div className="admin-fields">
              <label>Name<input value={treatment.name} onChange={(event) => updateItem("treatments", index, "name", event.target.value)} required /></label>
              <label>Category<input value={treatment.category} onChange={(event) => updateItem("treatments", index, "category", event.target.value)} required /></label>
              <label>Description<input value={treatment.description} onChange={(event) => updateItem("treatments", index, "description", event.target.value)} required /></label>
              <label>Duration<input value={treatment.duration} onChange={(event) => updateItem("treatments", index, "duration", event.target.value)} required /></label>
              <label>Price<input value={treatment.price} onChange={(event) => updateItem("treatments", index, "price", event.target.value)} required /></label>
              <label className="admin-checkbox"><input type="checkbox" checked={Boolean(treatment.featured)} onChange={(event) => updateItem("treatments", index, "featured", event.target.checked)} /> Feature on home page</label>
            </div>
          </fieldset>
        ))}
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      <div className="admin-save-bar">
        <button className="button button-dark" disabled={busy || uploadsInProgress > 0}>{uploadsInProgress ? "Uploading…" : busy ? "Saving…" : "Save changes"}</button>
        <button type="button" className="text-link" onClick={() => { setContent(null); setToken(""); setNotice(""); }}>Sign out</button>
      </div>
    </form>
  );
}
