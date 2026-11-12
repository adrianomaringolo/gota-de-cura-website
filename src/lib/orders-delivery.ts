import type { DeliveryInfo, Order } from '@/lib/types'

function deliveryLine(delivery: DeliveryInfo): string {
  if (delivery.method === 'pickup') return 'Retira na loja'
  const extra = delivery.complement ? ` — ${delivery.complement}` : ''
  return `Envio: ${delivery.street}, ${delivery.number}${extra}, ${delivery.neighborhood}, ${delivery.city}/${delivery.state} (CEP ${delivery.zipcode}) — CPF ${delivery.cpf}`
}

/** One-line delivery summary for the admin; handles orders that predate the delivery step. */
export function deliverySummary(order: Order): string {
  const { delivery, contactInfo } = order
  if (delivery) return deliveryLine(delivery)
  if (contactInfo.city) return `${contactInfo.city} (CEP ${contactInfo.zipcode ?? '—'})`
  return '—'
}

/** The comment logged when the team changes how an order will be delivered. */
export function describeDeliveryChange(
  before: DeliveryInfo | undefined,
  after: DeliveryInfo,
): string {
  const from = before ? deliveryLine(before) : 'não definida'
  return `📦 Forma de entrega alterada.\nDe: ${from}\nPara: ${deliveryLine(after)}`
}
