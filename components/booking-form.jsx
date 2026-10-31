"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { whatsappHref } from "../lib/site-content";

export default function BookingForm({ content }) {
  const params = useSearchParams();
  const requestedTreatment = params.get("treatment");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [whatsappFallback, setWhatsappFallback] = useState("");
  const today = new Date();
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const treatment = content.treatments.find((item) => item.id === data.get("treatmentId"));
    const location = content.locations.find((item) => item.id === data.get("locationId")) || content.locations[0];
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const date = String(data.get("date") || "");
    const time = String(data.get("time") || "");
    const notes = String(data.get("notes") || "").trim();
    const whatsappMessage = [
      "Hello Waves Spa, I’ve submitted an appointment request.",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Treatment: ${treatment?.name || ""}`,
      `Location: ${location.name} — ${location.address}, ${location.city}`,
      `Preferred date: ${date}`,
      `Preferred time: ${time}`,
      notes ? `Notes: ${notes}` : "",
      "Please let me know if this time is available.",
    ].filter(Boolean).join("\n");
    const whatsappUrl = whatsappHref(content.whatsapp, whatsappMessage);
    setWhatsappFallback(whatsappUrl);

    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          date,
          time,
          notes,
          treatmentId: treatment?.id,
          locationId: location.id,
          website: data.get("website"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn’t save your request. Please try again.");
      setConfirmation({ whatsappUrl: data.get("alsoWhatsapp") ? whatsappUrl : "" });
    } catch (issue) {
      setError(issue.message || "We couldn’t save your request. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (confirmation) {
    return (
      <div className="booking-success" role="status">
        <span><Check /></span>
        <h2>Request received.</h2>
        <p>Your appointment is not confirmed yet. We’ll contact you to confirm the date and time.</p>
        {confirmation.whatsappUrl && (
          <a className="button button-dark booking-whatsapp-link" href={confirmation.whatsappUrl} target="_blank" rel="noreferrer">
            Also message us on WhatsApp <ArrowUpRight size={16} />
          </a>
        )}
        <button className="text-link" onClick={() => setConfirmation(null)}>Make another request</button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <label>Your name<input required name="name" autoComplete="name" maxLength="100" placeholder="Full name" /></label>
      <label>Phone or WhatsApp<input required name="phone" type="tel" autoComplete="tel" minLength="7" maxLength="40" placeholder="+977 …" /></label>
      <label>Treatment
        <select name="treatmentId" defaultValue={content.treatments.some((item) => item.id === requestedTreatment) ? requestedTreatment : content.treatments[0].id}>
          {content.treatments.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.price}</option>)}
        </select>
      </label>
      <label>Location
        <select name="locationId" defaultValue={content.locations[0].id}>
          {content.locations.map((location) => <option value={location.id} key={location.id}>{location.name} · {location.city}</option>)}
        </select>
      </label>
      <label>Preferred date<input required name="date" type="date" min={minimumDate} /></label>
      <label>Preferred time
        <select name="time" defaultValue="10:00">
          {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((time) => <option key={time}>{time}</option>)}
        </select>
      </label>
      <label className="wide-field">Anything we should know? <span className="optional">Optional</span>
        <textarea name="notes" rows="3" maxLength="1000" placeholder="Preferences, sensitivities, or a question" />
      </label>
      <label className="booking-whatsapp-option">
        <input type="checkbox" name="alsoWhatsapp" />
        <span>Open WhatsApp with these details after I submit</span>
      </label>
      <label className="booking-honeypot" aria-hidden="true" tabIndex="-1">Leave this field empty<input name="website" autoComplete="off" tabIndex="-1" /></label>
      {error && (
        <div className="booking-form-error" role="alert">
          <p>{error}</p>
          {whatsappFallback && <a href={whatsappFallback} target="_blank" rel="noreferrer">Send this request on WhatsApp instead <ArrowUpRight size={14} /></a>}
        </div>
      )}
      <button className="button button-dark submit-button" type="submit" disabled={saving}>{saving ? "Sending request…" : "Send booking request"} <ArrowUpRight size={16} /></button>
      <p className="form-note">This is a request, not a confirmed appointment. We’ll contact you to confirm.</p>
      <p className="form-note">We use your details to respond to this booking request.</p>
    </form>
  );
}
