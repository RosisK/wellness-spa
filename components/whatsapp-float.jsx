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
          <path className="whatsapp-bubble" d="M16.04 4a12 12 0 0 0-10.3 18.16L4 28l6.2-1.65A12 12 0 1 0 16.04 4Z" />
          <path className="whatsapp-phone" d="M21.1 18.4c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.61.14-.18.27-.71.89-.87 1.07-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.38-.82-.72-1.38-1.62-1.54-1.9-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.27.28-.46.09-.18.04-.34-.03-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.12 2.86c.14.18 1.94 2.96 4.69 4.15.65.28 1.16.45 1.55.58.65.21 1.24.18 1.7.11.52-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.33-.07-.11-.25-.18-.53-.32Z" />
        </svg>
      </span>
      <span className="whatsapp-float-copy">
        <span>Have any queries?</span>
        <strong>{content.whatsapp}</strong>
      </span>
    </a>
  );
}
