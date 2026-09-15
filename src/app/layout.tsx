import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const sans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Edunova — Özel Ders Operasyon Platformu",
    template: "%s | Edunova",
  },
  description:
    "Edunova ile saat paketleri, öğretmen hakedişi, ders teslimleri ve veli iletişimi tek panelde.",
  applicationName: "Edunova",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "Edunova — Özel Ders Operasyon Platformu",
    description:
      "Saat paketleri, öğretmen hakedişi, ders teslimleri ve veli iletişimi tek panelde.",
    type: "website",
    locale: "tr_TR",
    siteName: "Edunova",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfdfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a1d" },
  ],
};

/**
 * Tema, hidrasyondan önce uygulanır — böylece koyu temada açık ekran parlaması olmaz.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("edunova-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
