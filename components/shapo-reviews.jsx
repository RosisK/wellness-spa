import Script from "next/script";

export default function ShapoReviews({ enabled }) {
  if (!enabled) return null;

  return (
    <section className="shapo-reviews section-pad">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Guest reviews</p>
          <h2>What visitors <em>say.</em></h2>
        </div>
      </div>
      <div id="shapo-widget-3b77295cb01c85e66b53" />
      <Script
        id="shapo-embed-js"
        src="https://cdn.shapo.io/js/embed.js"
        strategy="afterInteractive"
      />
    </section>
  );
}
