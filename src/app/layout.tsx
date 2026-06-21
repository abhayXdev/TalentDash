import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TalentDash — Career Intelligence for India",
    template: "%s | TalentDash",
  },
  description: "Compare salaries, read real reviews, and find the right opportunities. India's career intelligence platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#F7F7F7] text-[#484848] antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
