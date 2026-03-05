import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palette — Extract Colors from Any Image",
  description:
    "Upload an image and instantly extract a beautiful color palette. Explore how your palette looks across different UI templates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa]">{children}</body>
    </html>
  );
}
