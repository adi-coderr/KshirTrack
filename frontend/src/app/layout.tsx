import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Milk Chilling Can | Live Monitoring Dashboard',
  description: 'Real-time telemetry and safe shelf-life tracking for smart milk chilling cans (DS18B20 + pH sensor)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
