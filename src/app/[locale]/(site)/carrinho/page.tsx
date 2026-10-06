import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CartFlow } from '@/components/cart/CartFlow'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cart' })

  return {
    title: t('metaTitle'),
    description: t('description'),
    // Per-visitor state — nothing here should ever be a search result.
    robots: { index: false, follow: true },
  }
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <CartFlow />
}
