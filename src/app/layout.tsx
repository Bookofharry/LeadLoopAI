import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadLoop AI",
  description: "Turn every customer conversation into an actionable sales pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
