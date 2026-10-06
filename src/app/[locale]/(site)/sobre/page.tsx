import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { PageHeader } from '@/components/site/PageHeader'
import { languageAlternates, localizedPath } from '@/lib/i18n'
import { SITE } from '@/lib/site'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return {
    title: t('metaTitle'),
    description: t('description'),
    alternates: languageAlternates('/sobre', locale),
    openGraph: {
      title: `${t('metaTitle')} · ${SITE.name}`,
      description: t('ogDescription'),
      url: localizedPath('/sobre', locale),
    },
  }
}

/** Keys under `about.values`, each with a `title` and a `text`. */
const values = [
  'socialResponsibility',
  'sustainability',
  'quality',
  'transparency',
  'innovation',
] as const

export default async function SobrePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')

  return (
    <>
      <PageHeader title={t('title')} lead={t('lead')} />

      <article className="bg-canvas py-20 lg:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div className="max-w-[68ch] space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>{t('story1')}</p>
              <p>{t('story2')}</p>
              <p>{t('story3', { morada: SITE.morada.name })}</p>
            </div>

            <div className="space-y-8">
              <figure className="m-0">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                  <Image
                    src="/images/visit/photo-05.jpg"
                    alt={t('photoAlt')}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-ink-muted">
                  {t('photoCaption')}
                </figcaption>
              </figure>

              <div className="rounded-2xl bg-brand-tint p-6">
                <h2 className="font-display text-xl font-semibold text-brand">
                  {t('mission')}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  {t('missionText')}
                </p>

                <h2 className="mt-6 font-display text-xl font-semibold text-brand">
                  {t('vision')}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  {t('visionText')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </article>

      <section className="bg-canvas-sunk py-20 lg:py-24">
        <Container>
          <h2 className="rule-mark text-3xl font-semibold text-ink">
            {t('valuesTitle')}
          </h2>

          <dl className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value} className="border-t border-line-strong py-6">
                <dt className="font-display text-xl font-semibold text-ink">
                  {t(`values.${value}.title`)}
                </dt>
                <dd className="mt-2 max-w-[46ch] text-base leading-relaxed text-ink-soft">
                  {t(`values.${value}.text`)}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-canvas py-16 lg:py-20">
        <Container className="flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-[40ch] font-display text-2xl text-ink">{t('cta')}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/visitas" size="lg">
              {t('visitFarm')}
            </ButtonLink>
            <ButtonLink href="/cromatografias" variant="outline" size="lg">
              {t('seeReports')}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
