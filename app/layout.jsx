import "./globals.css";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export const metadata = {
  title: { default: "Waves Spa | Lakeside, Pokhara", template: "%s | Waves Spa" },
  description: "Thoughtful massage and wellness rituals in Lakeside, Pokhara.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
