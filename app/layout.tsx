import type { Metadata } from "next";
import { ReactNode } from "react";
import { Space_Grotesk, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const saprona = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-saprona",
});

const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "Merak Intelligence",
  description:
    "Discover, orchestrate, and deploy composable AI agents crafted for modern intelligence workflows.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${saprona.variable} ${garamond.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
