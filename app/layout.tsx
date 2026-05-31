import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import BypassExtensionHydration from "@/components/ui/BypassExtensionHydration";
import "./globals.css";

const almarai = Almarai({
  subsets: ["arabic"],
  variable: "--font-almarai",
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stockify — إدارة المطعم",
  description: "نظام إدارة مطعم شامل للطلبات والمخزون والكاشير",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${almarai.variable} h-full`}
    >
      <head />
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <BypassExtensionHydration />
        {children}
      </body>
    </html>
  );
}
