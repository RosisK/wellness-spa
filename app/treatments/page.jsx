import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { treatments } from "../../lib/treatments";
export const metadata = { title: "Treatments & prices" };
export default function TreatmentsPage() {
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <p className="eyebrow">Treatments and prices</p>
        <h1>Services at<br /><em>Waves Spa.</em></h1>
        <p>Session lengths and prices are listed below. Select a treatment to include it in an appointment request.</p>
      </section>
      <section className="catalog">
        {treatments.map((item, index) => (
          <article className="catalog-card" key={item.id}>
            <span className="row-number">0{index + 1}</span>
            <div>
              <p className="eyebrow">{item.category} · {item.duration}</p>
              <h2>{item.name}</h2>
              <p className="muted">{item.description}</p>
            </div>
            <div className="catalog-action">
              <strong>{item.price}</strong>
              <Link href={`/book?treatment=${item.id}`} className="text-link">
                Request this treatment <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <p className="fine-print">Prices are in Nepalese rupees. Please mention any preferences or sensitivities in your request.</p>
    </div>
  );
}
