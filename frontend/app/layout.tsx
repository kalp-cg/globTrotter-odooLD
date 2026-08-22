import type { Metadata } from "next";
import { Kalam, Lora, Courier_Prime } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

// Display/handwritten: headers, stickers, annotations, stamps
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

// Body: paragraphs, descriptions, journal text
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

// Utility: dates, prices, timestamps, luggage-tag labels
const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GlobeTrotter",
  description: "Travel-planning scrapbook app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kalam.variable} ${lora.variable} ${courier.variable}`} suppressHydrationWarning>
      <body className="antialiased selection:bg-marigold selection:text-ink" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <AuthGuard>{children}</AuthGuard>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
