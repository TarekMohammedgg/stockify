import type { Metadata } from "next";
import { Almarai, Reem_Kufi, Fraunces } from "next/font/google";
import "./globals.css";

const almarai = Almarai({
  subsets: ["arabic"],
  variable: "--font-almarai",
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  variable: "--font-reem",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stockify — إدارة المطعم",
  description: "نظام إدارة مطعم شامل للطلبات والمخزون والكاشير",
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
      className={`${almarai.variable} ${reemKufi.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
