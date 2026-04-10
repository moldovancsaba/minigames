import './globals.css';

export const metadata = {
  title: 'Kids Swipe Game',
  description: 'Swipe, compare, and rank cards in a kid-friendly game.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kids Swipe Game'
  },
  icons: {
    icon: '/images/card_01.jpeg',
    apple: '/images/card_01.jpeg'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
