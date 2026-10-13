import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Engine } from "@/components/Engine";
import { Header } from "@/components/Header";
import { Toasts } from "@/components/Toasts";
import { TopUp } from "@/components/TopUp";
import { Viewer } from "@/components/Viewer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kino Studio",
  description: "Prompt to still to shot: generate images, then animate them with cinematic camera moves.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}>
        <Header />
        {children}
        <Engine />
        <Viewer />
        <TopUp />
        <Toasts />
      </body>
    </html>
  );
}
