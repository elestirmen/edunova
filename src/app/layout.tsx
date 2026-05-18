import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: "Edunova - Özel Ders Operasyon Platformu",
  description:
    "Edunova ile saat paketleri, öğretmen hakedişi, ders teslimleri ve veli iletişimi tek panelde.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
