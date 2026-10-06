import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { PaymentTerms } from '@/components/visits/PaymentTerms'
import { PhotoGallery } from '@/components/visits/PhotoGallery'
import { VisitDates } from '@/components/visits/VisitDates'
import { VisitVideo } from '@/components/visits/VisitVideo'
import { VISIT_PRICES_NUMERIC } from '@/lib/constants'
import { formatCalendarDay, formatCurrency } from '@/lib/format'
import { languageAlternates, localizedPath } from '@/lib/i18n'
import { SITE, VISITS_OPEN } from '@/lib/site'
import { visitProgram, visitTestimonies } from '@/lib/visit-content'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'visits' })

  return {
    title: t('metaTitle'),
    description: t('description'),
    alternates: languageAlternates('/visitas', locale),
    openGraph: {
      title: t('metaTitle'),
      description: t('ogDescription'),
      url: localizedPath('/visitas', locale),
      images: [{ url: '/images/visit/photo-10.jpg', width: 1200, height: 630 }],
    },
  }
}

export default async function VisitasPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('visits')
  const program = await getTranslations('visitProgram')
  const prices = await getTranslations('visitPrices')
  const price = (value: number) =>
    value ? formatCurrency(value, locale) : prices('free')

  return (
    <>
      <header className="relative isolate overflow-hidden bg-brand-darkest text-white">
        <Image
          src="/images/visit/photo-10.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-22"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-brand-darkest via-brand-darkest/88 to-brand-darkest/45"
        />

        <Container className="relative pt-32 pb-16 lg:pt-44 lg:pb-24">
          <h1 className="max-w-[16ch] text-4xl font-semibold">{t('title')}</h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-white/80">
            {t('lead')}
          </p>
          {locale !== 'pt-BR' && (
            <p className="mt-4 max-w-[58ch] text-base text-white/70">
              {t('languageNote')}
            </p>
          )}

          <div className="mt-10">
            <h2 className="text-sm font-semibold text-white/70">{t('nextDates')}</h2>
            <VisitDates tone="light" className="mt-3" />
          </div>

          {VISITS_OPEN && (
            <ButtonLink
              href="/visitas/inscricao"
              variant="onDark"
              size="lg"
              className="mt-8"
            >
              {t('signUp')}
            </ButtonLink>
          )}
        </Container>
      </header>

      <section className="bg-canvas py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="rule-mark mx-auto text-3xl font-semibold text-ink [&::before]:mx-auto">
              {t('videoTitle')}
            </h2>
            <p className="mx-auto mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft">
              {t('videoLead')}
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl">
            <VisitVideo />
          </div>
        </Container>
      </section>

      <section className="bg-canvas-sunk py-20 lg:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <h2 className="rule-mark text-3xl font-semibold text-ink">
                {t('dayTitle')}
              </h2>
              <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft">
                {t('dayBody', { morada: SITE.morada.name })}
              </p>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft">
                {t('dayLength')}
              </p>
            </div>

            <ol className="space-y-px">
              {visitProgram.map((entry) => (
                <li
                  key={entry}
                  className="grid gap-x-6 gap-y-1 border-t border-line py-6 last:border-b sm:grid-cols-[5rem_1fr]"
                >
                  <span className="font-display text-xl font-semibold text-terra tabular-nums">
                    {program(`${entry}.time`)}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {program(`${entry}.title`)}
                    </h3>
                    <p className="mt-1.5 max-w-[54ch] text-base leading-relaxed text-ink-soft">
                      {program(`${entry}.text`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="bg-canvas py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <h2 className="rule-mark text-3xl font-semibold text-ink">
                {t('pricesTitle')}
              </h2>
              <dl className="mt-6 space-y-2 text-base">
                {[
                  [t('adults'), price(VISIT_PRICES_NUMERIC.ADULT)],
                  [t('children'), price(VISIT_PRICES_NUMERIC.CHILD)],
                  [t('little'), price(VISIT_PRICES_NUMERIC.FREE)],
                ].map(([label, price]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-2"
                  >
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="font-display text-lg font-semibold text-ink tabular-nums">
                      {price}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-base font-medium text-terra">{t('limited')}</p>
            </div>

            <PaymentTerms />
          </div>
        </Container>
      </section>

      <section className="bg-canvas-sunk py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="rule-mark text-3xl font-semibold text-ink">
              {t('galleryTitle')}
            </h2>
            <a
              href={SITE.photoAlbum}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
            >
              {t('album')}
            </a>
          </div>
          <div className="mt-10">
            <PhotoGallery />
          </div>
        </Container>
      </section>

      <section className="bg-brand-deep py-20 text-white lg:py-24">
        <Container>
          <h2 className="rule-mark text-3xl font-semibold">{t('testimoniesTitle')}</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {visitTestimonies.map((testimony) => (
              <figure key={testimony.name} className="flex flex-col">
                <blockquote
                  lang="pt-BR"
                  className="flex-1 text-base leading-relaxed text-white/80"
                >
                  {testimony.text}
                </blockquote>
                <figcaption className="mt-5 border-t border-white/15 pt-4">
                  <span className="block font-display text-lg text-white">
                    {testimony.name}
                  </span>
                  <span className="text-sm text-white/75">
                    {t('visitedOn', {
                      date: formatCalendarDay(
                        testimony.visitedOn,
                        { day: 'numeric', month: 'long', year: 'numeric' },
                        locale,
                      ),
                    })}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          {VISITS_OPEN && (
            <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/15 pt-10">
              <p className="flex-1 font-display text-2xl text-white">{t('ctaTitle')}</p>
              <ButtonLink href="/visitas/inscricao" variant="onDark" size="lg">
                {t('cta')}
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
