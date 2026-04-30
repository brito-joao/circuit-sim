import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON-Driven Digital Simulator",
  description: "Interactive circuit diagram engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
