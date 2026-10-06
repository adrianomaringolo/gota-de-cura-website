import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { OrderStatus } from '@/components/orders/OrderStatus'

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'order' })

  return {
    title: t('metaTitle'),
    description: t('description'),
    // Per-order state, not a search result.
    robots: { index: false, follow: true },
  }
}

export default async function OrderStatusPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  return <OrderStatus orderRef={id} />
}
