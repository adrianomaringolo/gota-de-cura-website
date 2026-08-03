import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import { amarillo, ampleSoft, archivo, petrona } from '@/lib/fonts'
import { CartProvider } from '@/lib/cart-context'
import { SITE } from '@/lib/site'
import './globals.css'

const DEFAULT_TITLE = `${SITE.name} — óleos essenciais e hidrolatos artesanais`

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  // Deliberately no `alternates.canonical` here: root metadata is inherited, so
  // a canonical set once would make every page claim to be the homepage.
  keywords: [
    'óleos essenciais',
    'hidrolatos',
    'aromaterapia',
    'sabonetes artesanais',
    'produtos artesanais',
    'destilação artesanal',
    'Campinas',
  ],
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
    locale: 'pt_BR',
    url: SITE.url,
    siteName: SITE.name,
    title: DEFAULT_TITLE,
    description: SITE.description,
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: `Loja da ${SITE.name} com óleos essenciais, hidrolatos e sabonetes artesanais`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: SITE.description,
    images: ['/images/og-default.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#503484',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${petrona.variable} ${archivo.variable} ${amarillo.variable} ${ampleSoft.variable}`}
    >
      <body>
        <CartProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'oklch(0.24 0.03 300)',
                color: 'white',
                borderRadius: '999px',
                padding: '10px 18px',
                fontSize: '0.9375rem',
              },
            }}
          />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
