import Link from "next/link";
import { ArrowUpRight, Heart, Leaf, Sparkles } from "lucide-react";
export const metadata = { title: "About Waves Spa" };
export default function AboutPage() {
  const services = [
    [Heart, "Personal consultations", "We ask about your preferences before each treatment."],
    [Leaf, "Massage and body care", "Choose a treatment from the menu and let us know about any sensitivities."],
    [Sparkles, "A relaxed visit", "Arrive a little early to settle in before your appointment."],
  ];

  return (
    <div className="page-wrap">
      <section className="page-hero">
        <p className="eyebrow">About Waves Spa</p>
        <h1>Massage and wellness<br /><em>in Pokhara.</em></h1>
        <p>Waves Spa is located in Lakeside 6. We offer massage, facials, and body treatments.</p>
      </section>
      <section className="about-grid">
        <div className="about-image">
          <img src="/pokhara-spa-retreat.png" alt="Plants in the Waves Spa courtyard" />
        </div>
        <div className="about-copy">
          <p className="eyebrow">What to expect</p>
          <h2>A straightforward<br /><em>spa visit.</em></h2>
          <p>Before your treatment, we’ll ask what you’re looking for and whether there are areas you’d like us to avoid. You can also share preferences or sensitivities when you request an appointment.</p>
          <p>Tea and time to get settled are available before your session.</p>
          <Link className="text-link" href="/treatments">View treatments and prices <ArrowUpRight size={16} /></Link>
        </div>
      </section>
      <section className="values">
        {services.map(([Icon, title, copy]) => (
          <article key={title}>
            <Icon size={23} />
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <div className="center-cta">
        <p className="eyebrow">Appointments</p>
        <Link className="button button-dark" href="/book">Request a time <ArrowUpRight size={16} /></Link>
      </div>
    </div>
  );
}
