import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vortex — PC Game Library",
    template: "%s | Vortex",
  },
  description:
    "Discover, track, and share your PC gaming journey. Build your library, write reviews, create collections.",
  keywords: ["games", "pc gaming", "game library", "reviews", "game tracking"],
  authors: [{ name: "Vortex" }],
  creator: "Vortex",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Vortex",
    title: "Vortex — PC Game Library",
    description: "Discover, track, and share your PC gaming journey.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vortex — PC Game Library",
    description: "Discover, track, and share your PC gaming journey.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
