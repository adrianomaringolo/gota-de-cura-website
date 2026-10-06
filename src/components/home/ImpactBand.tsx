import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/site/Section'
import { SITE } from '@/lib/site'

const links = [
  { label: 'Website', href: SITE.morada.site },
  { label: 'Instagram', href: SITE.morada.instagram },
  { label: 'Facebook', href: SITE.morada.facebook },
]

export function ImpactBand() {
  const t = useTranslations('impact')

  return (
    <section className="relative isolate overflow-hidden bg-brand-darkest text-white">
      <Image
        src="/images/visit/photo-12.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-brand-darkest via-brand-darkest/90 to-brand-darkest/55"
      />

      <Container className="relative py-24 lg:py-32">
        <div className="max-w-[52ch]">
          <h2 className="rule-mark text-3xl font-semibold">{t('title')}</h2>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            {t.rich('lead', {
              name: SITE.morada.name,
              strong: (chunks) => (
                <strong className="font-semibold text-white">{chunks}</strong>
              ),
            })}
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t('body')}</p>

          <ul className="mt-9 flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-brand-darkest"
                >
                  {link.label === 'Website' ? t('website') : link.label}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
