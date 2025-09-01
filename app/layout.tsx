import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClientLayout } from "@/components/layouts/client-layout";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClarityProvider } from "@/components/clarity-provider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Better font loading performance
  preload: true,
  weight: ["300", "400", "500", "600", "700"], // Only load needed weights
});

export const metadata: Metadata = {
  title: "The Barber Shop | Men's Club",
  description:
    "Professional online appointment management system for barber shops. Book appointments easily and manage your bookings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geist.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <ClarityProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="barber-app-theme"
        >
          <ClientLayout>
            {children}
            <SpeedInsights />
          </ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
