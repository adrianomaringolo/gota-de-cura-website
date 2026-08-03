import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Wordmark } from './Wordmark'
import { SocialLinks } from './SocialLinks'

const columns = [
  {
    title: 'Catálogo',
    links: [
      { label: 'Todos os produtos', href: '/#catalogo' },
      { label: 'Óleos essenciais', href: '/oleos-essenciais' },
      { label: 'Hidrolatos', href: '/hidrolatos' },
      { label: 'Sabonetes artesanais', href: '/sabonetes' },
      { label: 'Vale-presente', href: '/vales' },
    ],
  },
  {
    title: 'A chácara',
    links: [
      { label: 'Visita guiada', href: '/visitas' },
      { label: 'Inscrição para visita', href: '/visitas/inscricao' },
      { label: 'Cromatografias', href: '/cromatografias' },
      { label: 'Sobre nós', href: '/sobre' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-brand-darkest text-white">
      <div className="mx-auto max-w-[86rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark tone="light" size="md" withTagline />
            <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-white/70">
              Óleos essenciais, hidrolatos e artesanato destilados e feitos à mão na
              Chácara da Mãe Luzia, em Santo Antônio de Posse (SP).
            </p>
            <SocialLinks className="mt-6" tone="light" />
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-sans text-2xs font-bold tracking-[0.14em] text-white/70 uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-sans text-2xs font-bold tracking-[0.14em] text-white/70 uppercase">
              Loja física
            </h2>
            <address className="mt-4 text-sm leading-relaxed text-white/80 not-italic">
              {SITE.store.address}
            </address>
            <dl className="mt-4 space-y-1 text-sm text-white/70">
              {SITE.store.hours.map(([day, hours]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt>{day}</dt>
                  <dd className="text-white/90 tabular-nums">{hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[62ch]">
            Toda a renda é revertida para os trabalhos assistenciais da{' '}
            <a
              href={SITE.morada.site}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              {SITE.morada.name}
            </a>
            , em Campinas/SP.
          </p>
          <Link
            href="/admin"
            className="shrink-0 text-white/65 transition-colors hover:text-white"
          >
            Área da equipe
          </Link>
        </div>
      </div>
    </footer>
  )
}
