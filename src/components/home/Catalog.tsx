import { useTranslations } from 'next-intl'
import { CategoryTile } from '@/components/products/CategoryTile'
import { Container, SectionHead } from '@/components/site/Section'
import { productTypes } from '@/lib/product-types'

export function Catalog() {
  const t = useTranslations('catalog')

  return (
    <section id="catalogo" className="scroll-mt-24 bg-canvas py-20 lg:py-28">
      <Container>
        <SectionHead title={t('title')} lead={t('lead')} className="text-brand" />

        <div className="mt-12 grid auto-rows-fr grid-flow-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {productTypes.map((type, index) => (
            <CategoryTile key={type.id} type={type} priority={index < 4} />
          ))}
        </div>
      </Container>
    </section>
  )
}
