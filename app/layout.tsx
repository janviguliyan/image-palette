import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design System Generator — Palette from Image or Brand Colors",
  description:
    "Generate a complete design system palette from any image or brand color. Get 50–900 scales, neutral greys, semantic colors, WCAG accessibility checks, and export tokens for CSS, Tailwind, and Figma.",
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
