import type { Metadata } from 'next'
import { ProductDetail } from '@/components/products/ProductDetail'
import { getProductType } from '@/lib/product-types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; productId: string }>
}): Promise<Metadata> {
  const { type } = await params
  const productType = getProductType(type)
  return { title: productType?.type ?? 'Produto' }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ type: string; productId: string }>
}) {
  const { type, productId } = await params
  return <ProductDetail urlName={`/${type}/${productId}`} typeId={type} />
}
