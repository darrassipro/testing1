// client/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['fr', 'ar', 'en'];

export const metadata: Metadata = {
  title: 'go fez',
  description: 'go fez',
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; 
}) {
  const { locale } = await params;  

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
