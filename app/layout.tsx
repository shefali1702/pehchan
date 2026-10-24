import type { Metadata, Viewport } from "next";
import { Tiro_Devanagari_Hindi, Mukta, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const tiro = Tiro_Devanagari_Hindi({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "devanagari"],
  variable: "--font-tiro",
  display: "swap",
});
const mukta = Mukta({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "devanagari"],
  variable: "--font-mukta",
  display: "swap",
});
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Pehchan",
  description: "A family's own photos and real voices, made into a gentle daily reel for someone living with dementia.",
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#120e0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tiro.variable} ${mukta.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
