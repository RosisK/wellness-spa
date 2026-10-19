import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { getSiteContent } from "../lib/site-content";

export default async function HomePage() {
  const content = await getSiteContent();
  const location = content.locations[0];
  const featuredTreatments = content.treatments.filter((item) => item.featured);
  const homeTreatments = (featuredTreatments.length ? featuredTreatments : content.treatments).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow light">Massage · Facials · Body treatments</p>
          <h1>Waves Spa<br /><em>in Lakeside.</em></h1>
          <p className="hero-intro">
            Massage and wellness treatments in Pokhara, Nepal.
          </p>
          <Link className="button button-light" href="/treatments">
            View treatments <ArrowUpRight size={16} />
          </Link>
          <div className="hero-note">
            <span>{content.hours}</span>
            <span>{location.address}, {location.city}</span>
          </div>
        </div>
        <div className="hero-image">
          <img src="/pokhara-spa-hero.png" alt="Treatment room at Waves Spa" />
          <span className="image-caption">Waves Spa · Pokhara</span>
        </div>
      </section>

      <section className="intro section-pad">
        <div>
          <p className="eyebrow">Waves Spa</p>
          <h2>Treatments to help<br />you <em>unwind.</em></h2>
        </div>
        <div className="intro-copy">
          <p>
            Choose from massage, facial, and body treatments. Each visit
            includes time to discuss your preferences before your session.
          </p>
          <Link className="text-link" href="/about">
            About the spa <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <section className="treatment-preview section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Services and prices</p>
            <h2>Popular <em>treatments.</em></h2>
          </div>
          <Link className="text-link" href="/treatments">
            See all treatments <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="treatment-list">
          {homeTreatments.map((item, index) => (
            <article className="treatment-row" key={item.id}>
              <span className="row-number">0{index + 1}</span>
              <div>
                <p className="eyebrow">{item.category} · {item.duration}</p>
                <h3>{item.name}</h3>
                <p className="muted">{item.description}</p>
              </div>
              <strong>{item.price}</strong>
              <Link
                href={`/book?treatment=${item.id}`}
                className="row-arrow"
                aria-label={`Request ${item.name}`}
              >
                <ArrowUpRight size={20} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="split-story">
        <div className="story-image">
          <img src="/pokhara-spa-retreat.png" alt="Plants in the spa courtyard" />
        </div>
        <div className="story-copy">
          <p className="eyebrow light">Visit Waves Spa</p>
          <h2>In Lakeside,<br /><em>Pokhara.</em></h2>
          <p>
            Find us at {location.address}, {location.city}. {content.hours}.
          </p>
          <Link className="button button-light" href="/visit">
            Hours and directions <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <section className="visit-strip">
        <div>
          <p className="eyebrow">Address</p>
          <a className="visit-title" href={location.mapUrl} target="_blank" rel="noreferrer">
            {location.address}, {location.city}
          </a>
        </div>
        <div className="visit-meta">
          <span><Clock3 size={16} /> {content.hours}</span>
          <span><MapPin size={16} /> {location.region}, {location.country}</span>
        </div>
        <Link className="text-link" href="/book">
          Request an appointment <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}
