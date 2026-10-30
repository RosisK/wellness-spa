export const defaultSiteContent = {
  phone: "982-3682291",
  whatsapp: "982-3682291",
  hours: "Daily · 9:00–20:00",
  showReviews: true,
  images: {
    hero: { url: "/pokhara-spa-hero.png", path: null },
    story: { url: "/pokhara-spa-retreat.png", path: null },
    about: { url: "/pokhara-spa-retreat.png", path: null },
  },
  locations: [
    {
      id: "lakeside-pokhara",
      name: "Waves Spa",
      address: "Lakeside 6",
      city: "Pokhara",
      region: "Gandaki",
      country: "Nepal",
      mapUrl: "https://maps.google.com/?q=Lakeside+6+Pokhara+Nepal",
    },
  ],
  treatments: [
    { id: "lakeside-reset", name: "The Lakeside Reset", category: "Massage", description: "Full-body massage focused on areas of tension. Pressure can be adjusted during the session.", duration: "60 min", price: "NPR 4,200", featured: true },
    { id: "himalayan-warm-oil", name: "Himalayan Warm Oil", category: "Massage", description: "A full-body massage using warm herbal oils and compresses.", duration: "90 min", price: "NPR 6,500", featured: true },
    { id: "quiet-mind-ritual", name: "Quiet Mind Ritual", category: "Ritual", description: "Facial treatment with a scalp massage and singing bowl session.", duration: "75 min", price: "NPR 5,200", featured: true },
    { id: "river-stone-journey", name: "River Stone Journey", category: "Massage", description: "Massage using warm stones, with attention to the shoulders and legs.", duration: "90 min", price: "NPR 6,800", featured: false },
    { id: "rest-and-reset", name: "Rest & Reset", category: "Ritual", description: "Body polish followed by a full-body massage.", duration: "120 min", price: "NPR 8,900", featured: false },
  ],
};

export async function getSiteContent() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!projectUrl || !anonKey) return defaultSiteContent;

  try {
    const response = await fetch(
      `${projectUrl}/rest/v1/site_content?id=eq.1&select=content`,
      { headers: { apikey: anonKey }, cache: "no-store" },
    );

    if (!response.ok) return defaultSiteContent;
    const [row] = await response.json();
    if (!row?.content) return defaultSiteContent;

    const content = {
      ...defaultSiteContent,
      ...row.content,
      images: { ...defaultSiteContent.images, ...(row.content.images || {}) },
    };
    if (!Array.isArray(content.locations) || content.locations.length === 0) {
      content.locations = defaultSiteContent.locations;
    }
    if (!Array.isArray(content.treatments) || content.treatments.length === 0) {
      content.treatments = defaultSiteContent.treatments;
    }
    return content;
  } catch {
    return defaultSiteContent;
  }
}

export function telephoneHref(number) {
  let digits = String(number || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `tel:${digits.startsWith("977") ? `+${digits}` : `+977${digits}`}`;
}

export function whatsappHref(number, message = "") {
  let digits = String(number || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  const internationalNumber = digits.startsWith("977") ? digits : `977${digits}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${internationalNumber}${query}`;
}
