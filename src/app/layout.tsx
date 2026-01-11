import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subir-Portfolio-Dashboard",
  description: "This is Subir Das Portfolio. A professional and modern portfolio website showcasing my skills, projects, and experience in a visually appealing way.",
   keywords: " coding, programming, development, software, software engineer, full stack developer, ai automation, ai agent, technology, digital, companion, web development, app development, coding tutorials, coding resources, software tools, tech community, software development",
   icons: {
    icon: "/favicon-dp.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <Providers>
      <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster richColors position="top-center"/>
        {children}
      </body>
    </html>
  </Providers>
  );
}
