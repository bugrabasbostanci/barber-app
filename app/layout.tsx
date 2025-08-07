import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClientLayout } from "@/components/layouts/client-layout";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

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
    "Berber salonları için profesyonel online randevu yönetim sistemi. Kolay randevu alın, randevularınızı yönetin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning={true}>
      <body
        className={`${geist.className} antialiased`}
        suppressHydrationWarning={true}
      >
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
