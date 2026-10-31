import { getSiteContent } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

function cleanText(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(request) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) {
    return Response.json({ error: "Online booking is temporarily unavailable. Please call the spa." }, { status: 503 });
  }

  let form;
  try {
    form = await request.json();
  } catch {
    return Response.json({ error: "The request could not be read. Check the form and try again." }, { status: 400 });
  }
  if (!form || typeof form !== "object" || Array.isArray(form)) {
    return Response.json({ error: "The request could not be read. Check the form and try again." }, { status: 400 });
  }

  if (form.website) {
    return Response.json({ error: "The request could not be submitted." }, { status: 400 });
  }

  const name = cleanText(form.name, 100);
  const phone = cleanText(form.phone, 40);
  const date = cleanText(form.date, 10);
  const time = cleanText(form.time, 5);
  const notes = cleanText(form.notes, 1000);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 7 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(09|1[0-9]):00$/.test(time)) {
    return Response.json({ error: "Check your name, phone number, date, and preferred time." }, { status: 400 });
  }

  const localToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date || date < localToday) {
    return Response.json({ error: "Choose today or a future date." }, { status: 400 });
  }

  const content = await getSiteContent();
  const treatment = content.treatments.find((item) => item.id === form.treatmentId);
  const location = content.locations.find((item) => item.id === form.locationId);
  if (!treatment || !location) {
    return Response.json({ error: "Choose a current treatment and location." }, { status: 400 });
  }

  try {
    const response = await fetch(`${projectUrl}/rest/v1/booking_requests`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        treatment_id: treatment.id,
        treatment_name: treatment.name,
        location_id: location.id,
        location_name: location.name,
        preferred_date: date,
        preferred_time: time,
        guest_notes: notes,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      return Response.json({ error: "We couldn’t save your request. Please try again or contact the spa." }, { status: 502 });
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "We couldn’t reach the booking service. Please try again or contact the spa." }, { status: 502 });
  }
}
