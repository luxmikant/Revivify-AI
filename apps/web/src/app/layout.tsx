import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import PageTransition from "@/components/PageTransition";
import GlobalCommandPalette from "@/components/GlobalCommandPalette";
import GlobalAudioController from "@/components/GlobalAudioController";
import InteractiveCursor from "@/components/InteractiveCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerSpring Platform",
  description:
    "CareerSpring Platform is a professional career development suite for resume analysis, job matching, and certificate verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased text-white bg-obsidian`}>
        <ClerkProvider afterSignOutUrl="/">
          <GlobalAudioController>
            <InteractiveCursor />
            <GlobalCommandPalette />
            <PageTransition>{children}</PageTransition>
          </GlobalAudioController>
        </ClerkProvider>
      </body>
    </html>
  );
}
