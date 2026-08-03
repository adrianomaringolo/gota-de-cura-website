import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import { amarillo, ampleSoft, archivo, petrona } from '@/lib/fonts'
import { CartProvider } from '@/lib/cart-context'
import { SITE } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — óleos essenciais e hidrolatos artesanais`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: { icon: '/favicon.ico' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE.name,
    title: `${SITE.name} — óleos essenciais e hidrolatos artesanais`,
    description: SITE.description,
    images: ['/images/visit/photo-03.jpg'],
  },
  twitter: { card: 'summary_large_image' },
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
