import { Suspense } from "react";
import BookingForm from "../../components/booking-form";
export const metadata = { title: "Request an appointment" };
export default function BookPage() {
  return (
    <div className="page-wrap booking-page">
      <section className="page-hero">
        <p className="eyebrow">Appointments</p>
        <h1>Request a<br /><em>booking.</em></h1>
        <p>Choose a treatment and preferred time. We’ll contact you on WhatsApp to confirm availability.</p>
      </section>
      <section className="booking-layout">
        <div className="booking-aside">
          <p className="eyebrow">Please note</p>
          <p>Submitting a request does not reserve a time. Your appointment is confirmed after we reply.</p>
          <p className="eyebrow">Questions?</p>
          <a href="tel:+9779846021840">Call +977 984 602 1840</a>
        </div>
        <Suspense fallback={<p>Loading booking form…</p>}>
          <BookingForm />
        </Suspense>
      </section>
    </div>
  );
}
