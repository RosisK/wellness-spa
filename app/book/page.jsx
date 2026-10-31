import { Suspense } from "react";
import BookingForm from "../../components/booking-form";
import { getSiteContent, telephoneHref } from "../../lib/site-content";
export const metadata = { title: "Request an appointment" };
export default async function BookPage() {
  const content = await getSiteContent();
  return (
    <div className="page-wrap booking-page">
      <section className="page-hero">
        <p className="eyebrow">Appointments</p>
        <h1>Request a<br /><em>booking.</em></h1>
        <p>Send an appointment request and we’ll contact you to confirm availability. You can also follow up on WhatsApp.</p>
      </section>
      <section className="booking-layout">
        <div className="booking-aside">
          <p className="eyebrow">Please note</p>
          <p>Submitting a request does not reserve a time. Your appointment is confirmed after we reply.</p>
          <p className="eyebrow">Questions?</p>
          <a href={telephoneHref(content.phone)}>Call {content.phone}</a>
        </div>
        <Suspense fallback={<p>Loading booking form…</p>}>
          <BookingForm content={content} />
        </Suspense>
      </section>
    </div>
  );
}
