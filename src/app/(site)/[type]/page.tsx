import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductList } from '@/components/products/ProductList'
import { Container } from '@/components/site/Section'
import { getProductType, productTypes } from '@/lib/product-types'

export const dynamicParams = false

export function generateStaticParams() {
  return productTypes.map((type) => ({ type: type.id }))
}

const plainLabel = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const productType = getProductType(type)
  if (!productType) return {}

  const title = plainLabel(productType.typeLabel ?? productType.type)
  return {
    title,
    description:
      plainLabel(productType.description).slice(0, 180) ||
      `${title} artesanais da Gota de Cura.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const productType = getProductType(type)
  if (!productType) notFound()

  const title = plainLabel(productType.typeLabel ?? productType.type)

  return (
    <>
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
          <nav aria-label="Trilha" className="mb-6 text-sm text-white/70">
            <Link href="/#catalogo" className="transition-colors hover:text-white">
              Catálogo
            </Link>
            <span className="mx-2 text-white/30" aria-hidden="true">
              /
            </span>
            <span className="text-white/90">{title}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-6">
            <h1 className="max-w-[16ch] flex-1 text-4xl font-semibold">{title}</h1>
            {productType.seal && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={productType.seal} alt="" className="w-20 shrink-0 sm:w-24" />
            )}
          </div>

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
              Voltar para o catálogo
            </Link>
          </div>
        </Container>
      </div>
    </>
  )
}
