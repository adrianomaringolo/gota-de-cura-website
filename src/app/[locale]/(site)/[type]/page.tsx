import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProductList } from '@/components/products/ProductList'
import { Container } from '@/components/site/Section'
import { JsonLd } from '@/components/site/JsonLd'
import { Link } from '@/i18n/navigation'
import { languageAlternates, localizedPath } from '@/lib/i18n'
import {
  getProductType,
  localizeProductType,
  plainLabel,
  productTypes,
} from '@/lib/product-types'
import { breadcrumbSchema, graph } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return productTypes.map((type) => ({ type: type.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>
}): Promise<Metadata> {
  const { locale, type } = await params
  const shelf = getProductType(type)
  if (!shelf) return {}

  const t = await getTranslations({ locale, namespace: 'shelf' })
  const productType = localizeProductType(shelf, locale)
  const title = plainLabel(productType.typeLabel ?? productType.type)
  const description =
    plainLabel(productType.description).slice(0, 180) ||
    t('fallbackDescription', { title })
  const image = productType.image ? `/images/categories/${productType.image}` : undefined
  const path = `/${productType.id}`

  return {
    title,
    description,
    alternates: languageAlternates(path, locale),
    openGraph: {
      title: t('ogTitle', { title }),
      description,
      url: localizedPath(path, locale),
      images: image ? [{ url: image, alt: title }] : undefined,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>
}) {
  const { locale, type } = await params
  setRequestLocale(locale)
  const shelf = getProductType(type)
  if (!shelf) notFound()

  const t = await getTranslations('shelf')
  const productType = localizeProductType(shelf, locale)
  const title = plainLabel(productType.typeLabel ?? productType.type)

  return (
    <>
      <JsonLd
        schema={graph(
          breadcrumbSchema([
            { name: t('home'), path: localizedPath('/', locale) },
            { name: title, path: localizedPath(`/${productType.id}`, locale) },
          ]),
        )}
      />

      <header className="relative isolate overflow-hidden bg-brand-darkest text-white">
        {productType.areaBackground ? (
          <>
            <Image
              src={productType.areaBackground}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-25"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-brand-darkest via-brand-darkest/85 to-brand-darkest/40"
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-24 h-96 w-96 rounded-full bg-brand-lift/25 blur-3xl"
          />
        )}

        <Container className="relative pt-32 pb-14 lg:pt-40 lg:pb-20">
          <nav aria-label={t('breadcrumb')} className="mb-6 text-sm text-white/70">
            <Link href="/#catalogo" className="transition-colors hover:text-white">
              {t('catalog')}
            </Link>
            <span className="mx-2 text-white/30" aria-hidden="true">
              /
            </span>
            <span className="text-white/90">{title}</span>
          </nav>

          <h1 className="max-w-[16ch] text-4xl font-semibold">{title}</h1>

          {productType.description && (
            <div
              className="rich-text mt-6 max-w-[68ch] text-lg text-white/75 [&_b]:text-white [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: productType.description }}
            />
          )}
        </Container>
      </header>

      <div className="bg-canvas py-14 lg:py-20">
        <Container>
          {/* The shelf keeps its Portuguese `type`: it is the Firestore key. */}
          <ProductList productType={productType} />

          <div className="mt-16 border-t border-line pt-8">
            <Link
              href="/#catalogo"
              className="inline-flex items-center gap-2 text-base font-medium text-brand transition-colors hover:text-brand-deep"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              {t('back')}
            </Link>
          </div>
        </Container>
      </div>
    </>
  )
}
