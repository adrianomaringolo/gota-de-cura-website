import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/site'
import { Wordmark } from './Wordmark'
import { SocialLinks } from './SocialLinks'

/** Labels are keys in the `footer` namespace. */
const columns = [
  {
    title: 'catalog',
    links: [
      { label: 'allProducts', href: '/#catalogo' },
      { label: 'essentialOils', href: '/oleos-essenciais' },
      { label: 'hydrosols', href: '/hidrolatos' },
      { label: 'soaps', href: '/sabonetes' },
      { label: 'giftCard', href: '/vales' },
    ],
  },
  {
    title: 'farm',
    links: [
      { label: 'guidedVisit', href: '/visitas' },
      { label: 'visitSignup', href: '/visitas/inscricao' },
      { label: 'chromatographies', href: '/cromatografias' },
      { label: 'blog', href: '/blog' },
      { label: 'videos', href: '/videos' },
      { label: 'about', href: '/sobre' },
    ],
  },
] as const

export function Footer() {
  const t = useTranslations('footer')
  const store = useTranslations('store')

  return (
    <footer className="bg-brand-darkest text-white">
      <div className="mx-auto max-w-[86rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark tone="light" size="md" />
            <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-white/70">
              {t('blurb')}
            </p>
            <SocialLinks className="mt-6" tone="light" />
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={t(column.title)}>
              <h2 className="font-sans text-2xs font-bold tracking-[0.14em] text-white/70 uppercase">
                {t(column.title)}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-sans text-2xs font-bold tracking-[0.14em] text-white/70 uppercase">
              {t('store')}
            </h2>
            <address className="mt-4 text-sm leading-relaxed text-white/80 not-italic">
              {store('address')}
            </address>
            <dl className="mt-4 space-y-1 text-sm text-white/70">
              {SITE.store.hours.map(([day, hours]) => (
                <div key={day} className="flex justify-between gap-4">
                  <dt>{store(day)}</dt>
                  <dd className="text-white/90 tabular-nums">{store(hours)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[62ch]">
            {t.rich('proceeds', {
              name: SITE.morada.name,
              link: (chunks) => (
                <a
                  href={SITE.morada.site}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="shrink-0">
              {t('builtBy')}{' '}
              {/* noopener without noreferrer: the referrer is the point of a
                  portfolio credit. */}
              <a
                href="https://adrianomaringolo.dev"
                target="_blank"
                rel="noopener"
                className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
              >
                adrianomaringolo.dev
              </a>
            </p>
            {/* The panel has no `/en` twin, so this one link skips the locale prefix. */}
            <NextLink
              href="/admin"
              className="shrink-0 text-white/65 transition-colors hover:text-white"
            >
              {t('staffArea')}
            </NextLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
