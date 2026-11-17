import { Suspense } from "react";
import BookingForm from "../../components/booking-form";
import { getSiteContent, telephoneHref, whatsappHref } from "../../lib/site-content";
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
      <section className="booking-faq" aria-labelledby="booking-faq-title">
        <div>
          <p className="eyebrow">Before you book</p>
          <h2 id="booking-faq-title">Booking questions</h2>
        </div>
        <div className="booking-faq-list">
          <details>
            <summary>Is my appointment confirmed when I submit the form?</summary>
            <p>No. This sends a request. We’ll contact you to confirm the date and time.</p>
          </details>
          <details>
            <summary>What if I’m not sure which treatment to choose?</summary>
            <p>Select the closest option and tell us what you’re looking for in the notes. We can follow up before confirming.</p>
          </details>
          <details>
            <summary>How can I change my request or ask a question?</summary>
            <p>Call <a href={telephoneHref(content.phone)}>{content.phone}</a> or <a href={whatsappHref(content.whatsapp)} target="_blank" rel="noreferrer">message us on WhatsApp</a>.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
