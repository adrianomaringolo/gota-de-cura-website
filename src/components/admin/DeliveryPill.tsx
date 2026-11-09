import { Badge } from '@/components/ui/Feedback'
import type { DeliveryInfo } from '@/lib/types'

const icon = {
  viewBox: '0 0 24 24',
  className: 'h-3.5 w-3.5',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** "Retira na loja" (green) or "Precisa de envio" (terracotta); nothing for orders that predate the delivery step. */
export function DeliveryPill({ delivery }: { delivery?: DeliveryInfo }) {
  if (!delivery) return null

  if (delivery.method === 'pickup') {
    return (
      <Badge tone="positive">
        <svg {...icon}>
          <path d="M4 9.5 5.5 4h13L20 9.5" />
          <path d="M4 9.5a2.67 2.67 0 0 0 5.33 0 2.67 2.67 0 0 0 5.34 0A2.67 2.67 0 0 0 20 9.5" />
          <path d="M5 12.5V20h14v-7.5" />
        </svg>
        Retira na loja
      </Badge>
    )
  }

  return (
    <Badge tone="terra">
      <svg {...icon}>
        <path d="M3 6.5h11V17H3z" />
        <path d="M14 10h4l3 3.2V17h-7" />
        <circle cx="7.5" cy="17.5" r="1.6" />
        <circle cx="17.5" cy="17.5" r="1.6" />
      </svg>
      Precisa de envio
    </Badge>
  )
}
