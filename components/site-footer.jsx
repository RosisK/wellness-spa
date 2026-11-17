import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { telephoneHref, whatsappHref } from "../lib/site-content";

export default function SiteFooter({ content }) {
  const location = content.locations[0];

  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">~</span>
            <span>Waves <i>Spa</i></span>
          </Link>
          <p className="footer-copy">Massage, facials, and body treatments in Lakeside, Pokhara.</p>
        </div>
        <div>
          <p className="eyebrow">Find us</p>
          <p className="footer-detail">
            <MapPin size={16} />
            <a href={location.mapUrl} target="_blank" rel="noreferrer">
              {location.address}, {location.city}<br />{location.region}, {location.country}
            </a>
          </p>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <a className="footer-detail" href={telephoneHref(content.phone)}>
            <Phone size={16} /> {content.phone}
          </a>
          <a className="footer-detail" href={whatsappHref(content.whatsapp)} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> WhatsApp us
          </a>
        </div>
        <div>
          <p className="eyebrow">Pages</p>
          <Link className="footer-detail" href="/treatments">Treatments & prices</Link>
          <Link className="footer-detail" href="/about">About Waves</Link>
          <Link className="footer-detail" href="/visit">Hours & directions</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Waves Spa · Pokhara, Nepal</span>
          <Link className="footer-detail admin-link" href="/admin">Admin</Link>
      </div>
    </footer>
  );
}
