import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { PageHeader } from '@/components/site/PageHeader'

export default function PostNotFound() {
  const t = useTranslations('post')

  return (
    <>
      <PageHeader title={t('notFoundTitle')} lead={t('notFoundLead')} />
      <section className="bg-canvas py-16 lg:py-20">
        <Container>
          <ButtonLink href="/blog">{t('seeAll')}</ButtonLink>
        </Container>
      </section>
    </>
  )
}
