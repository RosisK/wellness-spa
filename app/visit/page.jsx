import Link from "next/link";
import { Clock3, MapPin, Phone, ArrowUpRight } from "lucide-react";
export const metadata = { title: "Visit Waves Spa" };
export default function VisitPage() {
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <p className="eyebrow">Visit Waves Spa</p>
        <h1>Hours and<br /><em>directions.</em></h1>
        <p>We’re at Lakeside 6 in Pokhara. Call or message us if you need help finding the spa.</p>
      </section>
      <section className="visit-page-grid">
        <div className="visit-details">
          <article><MapPin /><div><p className="eyebrow">Address</p><p>Lakeside 6<br />Pokhara, Gandaki, Nepal</p></div></article>
          <article><Clock3 /><div><p className="eyebrow">Opening hours</p><p>Every day<br />9:00 am – 8:00 pm</p></div></article>
          <article><Phone /><div><p className="eyebrow">Call or WhatsApp</p><a href="tel:+9779846021840">+977 984 602 1840</a></div></article>
          <Link className="button button-dark" href="/book">Request an appointment <ArrowUpRight size={16} /></Link>
        </div>
        <div className="map-card">
          <div className="map-art">
            <span className="map-lake">Phewa Lake</span>
            <span className="map-road">Lakeside Road</span>
            <span className="map-pin"><MapPin size={19} /> Waves Spa</span>
          </div>
          <a href="https://maps.google.com/?q=Lakeside+6+Pokhara+Nepal" target="_blank" rel="noreferrer" className="text-link">
            Open directions in Maps <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <p className="fine-print">Walk-ins are welcome when space allows. Contact us ahead of time to request a preferred appointment time.</p>
    </div>
  );
}
