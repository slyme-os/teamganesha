import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevaDarshan 360 - Virtual Mumbai Ganpati Darshan PWA',
  description: 'Immersive 360-degree virtual Ganpati Darshan platform for Mumbai Pandals (Lalbaugcha Raja, GSB Seva Mandal, Chinchpokli Chintamani) with live crowd status and direct 0%-fee UPI donations.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DevaDarshan 360',
  },
  icons: {
    icon: '/images/pandals/lalbaug_360.png',
    apple: '/images/pandals/lalbaug_360.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFB800',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-ganesha-dark text-slate-100 min-h-screen antialiased selection:bg-ganesha-gold selection:text-slate-950">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
