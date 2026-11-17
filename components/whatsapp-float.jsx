import { whatsappHref } from "../lib/site-content";

export default function WhatsAppFloat({ content }) {
  return (
    <a
      className="whatsapp-float"
      href={whatsappHref(content.whatsapp)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with Waves Spa on WhatsApp at ${content.whatsapp}`}
    >
      <span className="whatsapp-float-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M16 3.5a12.1 12.1 0 0 0-10.3 18.4L4 28l6.3-1.7A12.1 12.1 0 1 0 16 3.5Z" />
          <path d="M12.2 10.2c-.3-.7-.7-.7-1-.7h-.8c-.3 0-.8.1-1.2.6-.4.4-1.5 1.5-1.5 3.6s1.5 4.2 1.7 4.5c.2.3 2.9 4.6 7.1 6.2 3.5 1.4 4.2 1.1 5 .9.8-.1 2.5-1 2.8-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.8-.5l-2.5-1.2c-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.5-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.3-2-1.2-1.1-2-2.4-2.3-2.8-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7l-1.1-2.7Z" />
        </svg>
      </span>
      <span className="whatsapp-float-copy">
        <span>Have any queries?</span>
        <strong>{content.whatsapp}</strong>
      </span>
    </a>
  );
}
