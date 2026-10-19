import "./globals.css";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { getSiteContent } from "../lib/site-content";

export const metadata = {
  title: { default: "Waves Spa | Lakeside, Pokhara", template: "%s | Waves Spa" },
  description: "Thoughtful massage and wellness rituals in Lakeside, Pokhara.",
  icons: { icon: "/icon.svg" },
};

export default async function RootLayout({ children }) {
  const content = await getSiteContent();

  return (
    <html lang="en">
      <body>
        <SiteHeader content={content} />
        <main>{children}</main>
        <SiteFooter content={content} />
      </body>
    </html>
  );
}
