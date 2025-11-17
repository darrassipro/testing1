import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist, Mulish, IBM_Plex_Sans_Arabic, Cairo, Tajawal, Poppins, Six_Caps, Roboto } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ReduxProvider from '../lib/ReduxProvider';
import { Toaster } from '@/components/ui/sonner';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Police principale Cairo
const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

// Police Tajawal pour l'arabe
const tajawal = Tajawal({
  subsets: ['arabic'],
  variable: '--font-tajawal',
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});

// Police Poppins pour l'anglais/français
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const mulish = Mulish({
  subsets: ['latin'],
  variable: '--font-mulish',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-ibm-plex-sans-arabic',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

const sixCaps = Six_Caps({
  subsets: ['latin'],
  variable: '--font-six-caps',
  weight: '400',
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const locales = ['fr', 'ar', 'en'];

export const metadata: Metadata = {
  title: 'go fez',
  description: 'go fez',
  metadataBase: new URL('https://gofez.ma'),
  icons: '/icon.ico',
  openGraph: {
    title: 'go fez',
    description: 'go fez',
    url: 'https://gofez.ma',
    siteName: 'go fez',
    images: [
      {
        url: '/gofez_og.jpg',
        width: 1200,
        height: 630,
        alt: 'go fez',
      },
    ],
    locale: 'ar_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'go fez',
    description: 'go fez',
    images: ['/gofez_og.jpg'],
    creator: '@gofez',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&family=Six+Caps&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/bignoodletitling" rel="stylesheet" />
      </head>
 <body
        className={`${cairo.variable} ${tajawal.variable} ${poppins.variable} ${mulish.variable} ${ibmPlexSansArabic.variable} ${geistSans.variable} ${sixCaps.variable} ${roboto.variable} font-roboto antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Suspense>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </Suspense>
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}
