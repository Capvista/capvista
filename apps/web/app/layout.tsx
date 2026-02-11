import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Capvista - Private Markets Infrastructure for African Startups",
  description:
    "Connecting verified African startups with global capital through structured investment vehicles.",
  keywords: [
    "investment",
    "startups",
    "Africa",
    "Nigeria",
    "venture capital",
    "private markets",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
