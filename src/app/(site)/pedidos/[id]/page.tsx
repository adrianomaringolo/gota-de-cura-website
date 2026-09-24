import type { Metadata } from 'next'
import { OrderStatus } from '@/components/orders/OrderStatus'

export const metadata: Metadata = {
  title: 'Meu pedido',
  description: 'Acompanhe os detalhes e o status do seu pedido Gota de Cura.',
  // Per-order state, not a search result.
  robots: { index: false, follow: true },
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderStatus orderRef={id} />
}
