import type { Metadata, Viewport } from 'next'

/**
 * The in-store tablet display. It lives outside the `(site)` group on purpose:
 * no header, no footer, no navigation into the rest of the site, and nothing
 * on the site links here. It is reached only by typing the address into the
 * tablet's kiosk browser.
 */
export const metadata: Metadata = {
  title: 'Vitrine da loja',
  description: 'Display de balcão da Gota de Cura.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#503484',
  // A kiosk browser should not let a stray pinch zoom leave the layout stranded.
  maximumScale: 1,
  userScalable: false,
}

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-dvh overflow-hidden bg-canvas text-ink">{children}</div>
}
