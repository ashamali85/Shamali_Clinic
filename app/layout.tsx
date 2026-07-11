import type { Metadata, Viewport } from 'next';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Shamali Gastroenterology Clinic — Patient Registry',
  description: 'Patient registry for Dr. Shamali Gastroenterology Clinic.'
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
