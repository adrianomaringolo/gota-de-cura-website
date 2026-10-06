import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { AppProviders } from '@/components/site/AppProviders'
import { clientMessages } from '@/i18n/client-messages'
import { routing } from '@/i18n/routing'
import { amarillo, ampleSoft, archivo, petrona } from '@/lib/fonts'
import { localizedPath, ogLocale } from '@/lib/i18n'
import { SITE } from '@/lib/site'
import '../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('defaultTitle', { name: SITE.name })
  const description = t('description')

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s · ${SITE.name}`,
    },
    description,
    applicationName: SITE.name,
    // Deliberately no `alternates.canonical` here: root metadata is inherited, so
    // a canonical set once would make every page claim to be the homepage.
    keywords: t('keywords').split(', '),
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    category: 'shopping',
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    // Stops mobile Safari turning prices and street numbers into phone links.
    formatDetection: { telephone: false, address: false, email: false },
    openGraph: {
      type: 'website',
      locale: ogLocale(locale),
      alternateLocale: routing.locales.filter((l) => l !== locale).map(ogLocale),
      url: localizedPath('/', locale),
      siteName: SITE.name,
      title,
      description,
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: t('ogImageAlt', { name: SITE.name }),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-default.jpg'],
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#503484',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = clientMessages(await getMessages())

  return (
    <html
      lang={locale}
      className={`${petrona.variable} ${archivo.variable} ${amarillo.variable} ${ampleSoft.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
