import type { Metadata } from 'next'
import { amarillo, ampleSoft, archivo, petrona } from '@/lib/fonts'
import { SITE } from '@/lib/site'
import './globals.css'

/**
 * The 404 for a URL that matches no route at all. It renders outside every
 * layout — so outside any locale too — and therefore speaks both languages.
 */
export const metadata: Metadata = {
  title: `Página não encontrada · Page not found — ${SITE.name}`,
}

export default function GlobalNotFound() {
  return (
    <html
      lang="pt-BR"
      className={`${petrona.variable} ${archivo.variable} ${amarillo.variable} ${ampleSoft.variable}`}
    >
      <body>
        <main className="grid min-h-screen place-items-center bg-brand-darkest px-6 py-20 text-white">
          <div className="max-w-lg text-center">
            <img
              src="/images/logos/logo.png"
              alt={SITE.name}
              className="mx-auto h-20 w-auto brightness-0 invert"
            />
            <h1 className="mt-10 font-display text-3xl font-semibold">
              Não encontramos esta página
            </h1>
            <p lang="en" className="mt-2 text-lg text-white/70">
              We couldn&rsquo;t find this page
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="/"
                className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-brand-darkest transition-colors hover:bg-brand-soft"
              >
                Página inicial
              </a>
              <a
                href="/en"
                lang="en"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
              >
                Home page (English)
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
