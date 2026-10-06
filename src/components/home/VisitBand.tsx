import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { VisitDates } from '@/components/visits/VisitDates'
import { VISIT_PRICES_NUMERIC } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { VISITS_OPEN } from '@/lib/site'

export function VisitBand() {
  const t = useTranslations('visitBand')
  const prices = useTranslations('visitPrices')
  const locale = useLocale()
  const price = (value: number) =>
    value ? formatCurrency(value, locale) : prices('free')

  return (
    <section id="visitacao" className="scroll-mt-24 bg-canvas-sunk py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Two plates, offset — a spread, not a card grid */}
          <div className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src="/images/visit/photo-06.jpg"
                alt={t('photo1Alt')}
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="relative -mt-16 ml-auto hidden aspect-square w-2/5 overflow-hidden rounded-2xl border-4 border-canvas-sunk sm:block">
              <Image
                src="/images/visit/photo-01.jpg"
                alt={t('photo2Alt')}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="rule-mark text-3xl font-semibold text-ink">{t('title')}</h2>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-ink-soft">
              {t('lead')}
            </p>

            <dl className="mt-8 space-y-3 border-y border-line py-6 text-base">
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-28 shrink-0 text-ink-muted">{t('duration')}</dt>
                <dd className="font-medium text-ink">{t('durationValue')}</dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-28 shrink-0 text-ink-muted">{t('where')}</dt>
                <dd className="font-medium text-ink">{t('whereValue')}</dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-28 shrink-0 text-ink-muted">{t('price')}</dt>
                <dd className="font-medium text-ink">
                  {t('perPerson', { price: price(VISIT_PRICES_NUMERIC.ADULT) })}
                  <span className="block text-sm font-normal text-ink-soft">
                    {t('childPrices', {
                      child: price(VISIT_PRICES_NUMERIC.CHILD),
                      free: price(VISIT_PRICES_NUMERIC.FREE),
                    })}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-ink">
                {t('nextDates')}
                <span className="ml-2 font-normal text-terra">{t('limited')}</span>
              </h3>
              <VisitDates className="mt-3" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {VISITS_OPEN && (
                <ButtonLink href="/visitas/inscricao" variant="accent" size="lg">
                  {t('signUp')}
                </ButtonLink>
              )}
              <ButtonLink href="/visitas" variant="outline" size="lg">
                {t('howItWorks')}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
