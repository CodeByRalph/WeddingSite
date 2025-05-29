import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Ralph & Odette's Wedding",
  description: "Join us in celebrating our special day",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
