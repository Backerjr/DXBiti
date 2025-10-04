import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoujeeBot Concierge",
  description: "AI Boujee Detours & No-BS Travel Hacks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
