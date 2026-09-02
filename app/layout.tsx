import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustDial Merchant Reviews Analyzer",
  description: "Analyze merchant pain points from JustDial Play Store reviews",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
