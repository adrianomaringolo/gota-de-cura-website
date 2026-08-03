import type { Metadata } from 'next'
import { CromatografiasList } from '@/components/cromatografias/CromatografiasList'
import { Container } from '@/components/site/Section'
import { PageHeader } from '@/components/site/PageHeader'

export const metadata: Metadata = {
  title: 'Cromatografias',
  description:
    'Laudos completos de cromatografia dos óleos essenciais e hidrolatos destilados na Chácara da Mãe Luzia.',
  alternates: { canonical: '/cromatografias' },
  openGraph: {
    title: 'Cromatografias — o laudo de cada planta',
    description:
      'Publicamos o laudo de cromatografia completo de cada óleo essencial e hidrolato, do jeito que o laboratório entregou.',
    url: '/cromatografias',
  },
}

export default function CromatografiasPage() {
  return (
    <>
      <PageHeader
        title="Cromatografias"
        lead="Cromatografia é o exame que separa e identifica cada componente de uma mistura. Publicamos o laudo completo de cada óleo essencial e hidrolato — do jeito que o laboratório entregou."
      >
        <p className="max-w-[62ch] text-base text-white/70">
          Clique em qualquer planta para abrir o PDF do laudo.
        </p>
      </PageHeader>

      <div className="bg-canvas py-16 lg:py-20">
        <Container>
          <CromatografiasList />
        </Container>
      </div>
    </>
  )
}
