"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { telephoneHref, whatsappHref } from "../lib/site-content";

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
};

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(new Date(value));
}

export default function BookingInbox({ token }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!projectUrl || !anonKey) {
      setError("The database connection is not configured.");
      setLoading(false);
      return undefined;
    }

    setRefreshing(true);
    fetch(`${projectUrl}/rest/v1/booking_requests?select=*&order=created_at.desc&limit=100`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).then(async (response) => {
      const result = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(response.status === 404
          ? "Booking storage is not set up yet. Run the updated Supabase SQL file."
          : result.message || "Could not load booking requests.");
      }
      return result;
    }).then((result) => {
      if (active) {
        setRequests(result.map((item) => ({ ...item, persistedStatus: item.status })));
        setError("");
      }
    }).catch((issue) => {
      if (active) setError(issue.message || "Could not load booking requests.");
    }).finally(() => {
      if (active) {
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => { active = false; };
  }, [token, loadKey]);

  const counts = useMemo(() => requests.reduce((total, item) => {
    const status = item.persistedStatus || item.status;
    total[status] = (total[status] || 0) + 1;
    return total;
  }, {}), [requests]);
  const visibleRequests = filter === "all"
    ? requests
    : requests.filter((item) => (item.persistedStatus || item.status) === filter);

  function updateRequest(id, field, value) {
    setRequests((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  async function saveRequest(item) {
    setSavingId(item.id);
    setError("");
    setNotice("");
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    try {
      const response = await fetch(`${projectUrl}/rest/v1/booking_requests?id=eq.${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          customer_name: item.customer_name,
          customer_phone: item.customer_phone,
          treatment_name: item.treatment_name,
          location_name: item.location_name,
          preferred_date: item.preferred_date,
          preferred_time: item.preferred_time,
          guest_notes: item.guest_notes,
          status: item.status,
          admin_notes: item.admin_notes,
        }),
      });
      const result = await response.json().catch(() => []);
      if (!response.ok) throw new Error(result.message || "Could not save this booking request.");
      if (!result.length) throw new Error("This request was not updated. Refresh the list and try again.");
      setRequests((items) => items.map((requestItem) => requestItem.id === item.id
        ? { ...result[0], persistedStatus: result[0].status }
        : requestItem));
      setNotice("Booking request updated.");
    } catch (issue) {
      setError(issue.message || "Could not save this booking request.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="booking-inbox">
      <div className="booking-inbox-toolbar">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>Booking requests</h2>
          <p>Requests are private to signed-in admins. Changes are saved per request.</p>
        </div>
        <button type="button" className="admin-refresh" onClick={() => setLoadKey((key) => key + 1)} disabled={refreshing}>
          <RefreshCw size={15} /> {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="booking-filters" aria-label="Filter booking requests">
        {["pending", "confirmed", "declined", "completed", "all"].map((value) => (
          <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
            {value === "all" ? "All" : statusLabels[value]} <span>{value === "all" ? requests.length : counts[value] || 0}</span>
          </button>
        ))}
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading && <p className="booking-inbox-empty">Loading requests…</p>}
      {!loading && !error && visibleRequests.length === 0 && <p className="booking-inbox-empty">No {filter === "all" ? "booking" : filter} requests yet.</p>}

      <div className="booking-request-list">
        {visibleRequests.map((item) => (
          <article className="booking-request-card" key={item.id}>
            <header>
              <div>
                <p className="eyebrow">Received {formatCreatedAt(item.created_at)}</p>
                <h3>{item.customer_name}</h3>
                <a className="booking-customer-phone" href={telephoneHref(item.customer_phone)}>{item.customer_phone}</a>
              </div>
              <span className={`booking-status status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
            </header>

            <div className="booking-request-fields">
              <label>Name<input value={item.customer_name} onChange={(event) => updateRequest(item.id, "customer_name", event.target.value)} maxLength="100" required /></label>
              <label>Phone<input value={item.customer_phone} onChange={(event) => updateRequest(item.id, "customer_phone", event.target.value)} maxLength="40" required /></label>
              <label>Treatment<input value={item.treatment_name} onChange={(event) => updateRequest(item.id, "treatment_name", event.target.value)} maxLength="160" required /></label>
              <label>Location<input value={item.location_name} onChange={(event) => updateRequest(item.id, "location_name", event.target.value)} maxLength="160" required /></label>
              <label>Requested date<input type="date" value={item.preferred_date} onChange={(event) => updateRequest(item.id, "preferred_date", event.target.value)} required /></label>
              <label>Requested time<input type="time" value={item.preferred_time} onChange={(event) => updateRequest(item.id, "preferred_time", event.target.value)} required /></label>
              <label>Status<select value={item.status} onChange={(event) => updateRequest(item.id, "status", event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
              <label className="wide-field">Guest notes<textarea value={item.guest_notes || ""} onChange={(event) => updateRequest(item.id, "guest_notes", event.target.value)} rows="2" maxLength="1000" /></label>
              <label className="wide-field">Staff notes<textarea value={item.admin_notes || ""} onChange={(event) => updateRequest(item.id, "admin_notes", event.target.value)} rows="2" maxLength="1000" placeholder="Internal follow-up notes" /></label>
            </div>

            <footer>
              <a className="text-link" href={whatsappHref(item.customer_phone, `Hello ${item.customer_name}, following up on your Waves Spa appointment request.`)} target="_blank" rel="noreferrer">
                Message guest <ArrowUpRight size={14} />
              </a>
              <button type="button" className="button button-dark" onClick={() => saveRequest(item)} disabled={savingId === item.id}>
                {savingId === item.id ? "Saving…" : "Save request"}
              </button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
