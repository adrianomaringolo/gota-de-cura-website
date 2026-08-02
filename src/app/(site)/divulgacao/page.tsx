import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { EmptyState } from '@/components/ui/Feedback'

export const metadata: Metadata = {
  title: 'Divulgação',
  robots: { index: false },
}

export default function DivulgacaoPage() {
  return (
    <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
      <EmptyState
        title="Esta página ainda está sendo preparada"
        action={<ButtonLink href="/">Voltar para o início</ButtonLink>}
      >
        Em breve reunimos aqui os materiais de divulgação da Gota de Cura.
      </EmptyState>
    </Container>
  )
}
