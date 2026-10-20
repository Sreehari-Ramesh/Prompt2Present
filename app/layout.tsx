import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forma — AI Presentation Studio",
  description: "Create, edit, and present beautiful presentations with AI.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
