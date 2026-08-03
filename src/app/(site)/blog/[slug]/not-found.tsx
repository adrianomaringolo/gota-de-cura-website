import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { PageHeader } from '@/components/site/PageHeader'

export default function PostNotFound() {
  return (
    <>
      <PageHeader
        title="Este texto não está aqui"
        lead="O endereço pode ter mudado ou o texto ainda não foi publicado."
      />
      <section className="bg-canvas py-16 lg:py-20">
        <Container>
          <ButtonLink href="/blog">Ver todos os textos</ButtonLink>
        </Container>
      </section>
    </>
  )
}
