import type { Metadata } from 'next'
import { CartFlow } from '@/components/cart/CartFlow'

export const metadata: Metadata = {
  title: 'Meu pedido',
  description:
    'Revise os produtos escolhidos e envie sua reserva. A equipe Gota de Cura confirma disponibilidade e pagamento em seguida.',
}

export default function CartPage() {
  return <CartFlow />
}
