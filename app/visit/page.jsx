import Link from "next/link";
import { Clock3, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { getSiteContent, telephoneHref, whatsappHref } from "../../lib/site-content";
export const metadata = { title: "Visit Waves Spa" };
export default async function VisitPage() {
  const content = await getSiteContent();
  const location = content.locations[0];
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <p className="eyebrow">Visit Waves Spa</p>
        <h1>Hours and<br /><em>directions.</em></h1>
        <p>We’re at {location.address} in {location.city}. Call or message us if you need help finding the spa.</p>
      </section>
      <section className="visit-page-grid">
        <div className="visit-details">
          <article><MapPin /><div><p className="eyebrow">Address</p><a href={location.mapUrl} target="_blank" rel="noreferrer">{location.address}<br />{location.city}, {location.region}, {location.country}</a></div></article>
          <article><Clock3 /><div><p className="eyebrow">Opening hours</p><p>{content.hours}</p></div></article>
          <article><Phone /><div><p className="eyebrow">Call or WhatsApp</p><a href={telephoneHref(content.phone)}>{content.phone}</a><br /><a href={whatsappHref(content.whatsapp)} target="_blank" rel="noreferrer">Message on WhatsApp</a></div></article>
          <Link className="button button-dark" href="/book">Request an appointment <ArrowUpRight size={16} /></Link>
        </div>
        <div className="location-list">
          {content.locations.map((place) => (
            <div className="map-card" key={place.id}>
              <p className="eyebrow">{place.name}</p>
              <div className="map-art">
                <span className="map-lake">Phewa Lake</span>
                <span className="map-road">{place.city}</span>
                <a className="map-pin" href={place.mapUrl} target="_blank" rel="noreferrer"><MapPin size={19} /> {place.name}</a>
              </div>
              <a href={place.mapUrl} target="_blank" rel="noreferrer" className="text-link">
                {place.address}, {place.city} · Open in Maps <ArrowUpRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>
      <p className="fine-print">Walk-ins are welcome when space allows. Contact us ahead of time to request a preferred appointment time.</p>
    </div>
  );
}
