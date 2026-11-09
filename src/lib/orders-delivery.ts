import type { Order } from '@/lib/types'

/** One-line delivery summary for the admin; handles orders that predate the delivery step. */
export function deliverySummary(order: Order): string {
  const { delivery, contactInfo } = order
  if (delivery?.method === 'pickup') return 'Retira na loja'
  if (delivery?.method === 'shipping') {
    const extra = delivery.complement ? ` — ${delivery.complement}` : ''
    return `Envio: ${delivery.street}, ${delivery.number}${extra}, ${delivery.neighborhood}, ${delivery.city}/${delivery.state} (CEP ${delivery.zipcode})`
  }
  if (contactInfo.city) return `${contactInfo.city} (CEP ${contactInfo.zipcode ?? '—'})`
  return '—'
}
