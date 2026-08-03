import type { Metadata } from 'next'
import { ProductDetail } from '@/components/products/ProductDetail'
import { getProductType } from '@/lib/product-types'

/**
 * The product itself is fetched from Firestore in the browser, so its name and
 * price are not available while the head is built. What we can state truthfully
 * is the shelf it sits on — enough for a real title, description and canonical.
 * A crawler still receives an empty body; see README for the follow-up.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; productId: string }>
}): Promise<Metadata> {
  const { type, productId } = await params
  const shelf = getProductType(type)?.type ?? 'Produto'

  // `productId` is the product's own URL slug, so it reads well as a name.
  const name = productId
    .replace(/-/g, ' ')
    .replace(/^\p{Ll}/u, (letter) => letter.toUpperCase())

  return {
    title: `${name} — ${shelf}`,
    description: `${name}: ${shelf.toLowerCase()} artesanal da Gota de Cura, destilado na Chácara da Mãe Luzia. Toda a renda sustenta os trabalhos assistenciais da Morada Espírita Prof. Lairi Hans.`,
    alternates: { canonical: `/${type}/${productId}` },
    openGraph: {
      type: 'website',
      title: `${name} — ${shelf}`,
      url: `/${type}/${productId}`,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ type: string; productId: string }>
}) {
  const { type, productId } = await params
  return <ProductDetail urlName={`/${type}/${productId}`} typeId={type} />
}
