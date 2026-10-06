import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CromatografiasList } from '@/components/cromatografias/CromatografiasList'
import { Container } from '@/components/site/Section'
import { PageHeader } from '@/components/site/PageHeader'
import { languageAlternates, localizedPath } from '@/lib/i18n'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'chromatographyPage' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: languageAlternates('/cromatografias', locale),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: localizedPath('/cromatografias', locale),
    },
  }
}

export default async function CromatografiasPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('chromatographyPage')

  return (
    <>
      <PageHeader title={t('title')} lead={t('lead')}>
        <p className="max-w-[62ch] text-base text-white/70">{t('hint')}</p>
      </PageHeader>

      <div className="bg-canvas py-16 lg:py-20">
        <Container>
          <CromatografiasList />
        </Container>
      </div>
    </>
  )
}
