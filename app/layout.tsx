import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play Store Reviews Scraper",
  description: "Scrape and analyze Google Play Store app reviews",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
