import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { EnrollmentForm } from '@/components/visits/EnrollmentForm'
import { languageAlternates } from '@/lib/i18n'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'enrollment' })

  return {
    title: t('metaTitle'),
    description: t('description'),
    alternates: languageAlternates('/visitas/inscricao', locale),
  }
}

export default async function InscricaoPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <EnrollmentForm />
}
