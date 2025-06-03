import type { Metadata } from "next";
import { Yatra_One } from 'next/font/google';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const yatraOne = Yatra_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-yatra-one',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Lahara",
  description: "Nepal's First Freelancing & Influencer Marketplace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${yatraOne.variable} antialiased`}>
      <body>
        {children}
      </body>
    </html>
  );
}
