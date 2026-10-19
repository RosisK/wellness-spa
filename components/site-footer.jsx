import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";

export default function SiteFooter() {
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
            <span>Lakeside 6, Pokhara<br />Gandaki, Nepal</span>
          </p>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <a className="footer-detail" href="tel:+9779846021840">
            <Phone size={16} /> +977 984 602 1840
          </a>
          <a className="footer-detail" href="https://wa.me/9779846021840" target="_blank" rel="noreferrer">
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
        <span>Open daily · 9:00–20:00</span>
      </div>
    </footer>
  );
}
