import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Digital Logic Simulator',
  description: 'JSON-driven interactive breadboard circuit simulator',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Logic Sim',
  },
};

// Prevents iOS from zooming in on input focus, ensures full-screen height
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevent iOS pinch-zoom breaking the SVG canvas
  userScalable: false,
  viewportFit: 'cover', // Respects iPhone notch/home-bar safe areas
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0, overflow: 'hidden' }}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
