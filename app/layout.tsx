import type { Metadata } from "next";
import "./globals.css";

// export const metadata: Metadata = {
//   title: "Design System Generator — Palette from Image or Brand Colors",
//   description:
//     "Generate a complete design system palette from any image or brand color. Get 50–900 scales, neutral greys, semantic colors, WCAG accessibility checks, and export tokens for CSS, Tailwind, and Figma.",
// };

export const metadata: Metadata = {
  metadataBase: new URL("https://designsystem-generator-bbs.vercel.app/"),

  title: "Design System Generator — Palette from Image or Brand Colors",
  description:
    "Generate a complete design system palette from any image or brand color. Get 50–900 scales, neutral greys, semantic colors, WCAG accessibility checks, and export tokens for CSS, Tailwind, and Figma.",

  icons: {
    icon: "/icon.svg",
  },

  openGraph: {
    title: "Design System Generator",
    description:
      "Generate a complete design system palette from any image or brand color.",
    url: "/",
    siteName: "Design System Generator",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Design System Generator",
    description:
      "Generate a complete design system palette from any image or brand color.",
    images: ["/preview.png"],
  },
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
