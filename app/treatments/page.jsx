import { getSiteContent } from "../../lib/site-content";
import TreatmentFinder from "../../components/treatment-finder";
export const metadata = { title: "Treatments & prices" };
export default async function TreatmentsPage() {
  const { treatments } = await getSiteContent();
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <p className="eyebrow">Treatments and prices</p>
        <h1>Services at<br /><em>Waves Spa.</em></h1>
        <p>Compare session lengths and prices, or filter by an area of focus to find a treatment that suits you.</p>
      </section>
      <TreatmentFinder treatments={treatments} />
      <p className="fine-print">Prices are in Nepalese rupees. Please mention any preferences or sensitivities in your request.</p>
    </div>
  );
}
