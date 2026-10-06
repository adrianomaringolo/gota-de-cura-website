import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { AppProviders } from '@/components/site/AppProviders'
import { clientMessages } from '@/i18n/client-messages'
import { routing } from '@/i18n/routing'
import { amarillo, ampleSoft, archivo, petrona } from '@/lib/fonts'
import { SITE } from '@/lib/site'
import '../globals.css'

/**
 * Root layout for the team's areas — the admin panel and the in-store display.
 * They are Portuguese only and live outside `[locale]`, but share components
 * with the site, so they still get an intl provider pinned to Portuguese.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Pinned rather than read from the request, which keeps these pages static.
  setRequestLocale(routing.defaultLocale)
  const messages = clientMessages(await getMessages())

  return (
    <html
      lang={routing.defaultLocale}
      className={`${petrona.variable} ${archivo.variable} ${amarillo.variable} ${ampleSoft.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
