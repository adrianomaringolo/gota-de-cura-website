import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProductDetail } from '@/components/products/ProductDetail'
import { languageAlternates, localizedPath } from '@/lib/i18n'
import { getProductType, shelfName } from '@/lib/product-types'
import { localizeProduct } from '@/lib/products'
import { ProductsService } from '@/services/products'

/**
 * The page body fetches the product in the browser, so a crawler still receives
 * an empty body (see README for the follow-up). The head, though, looks the
 * product up here to title it in the page's language — the URL slug is always
 * Portuguese. If that lookup fails the slug stands in, as it always did.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string; productId: string }>
}): Promise<Metadata> {
  const { locale, type, productId } = await params
  const t = await getTranslations({ locale, namespace: 'productPage' })
  const productType = getProductType(type)
  const shelf = productType ? shelfName(productType, locale) : t('fallbackShelf')

  const product = await ProductsService.getProductByUrlName(
    `/${type}/${productId}`,
  ).catch(() => undefined)
  const name = product
    ? localizeProduct(product, locale).name
    : // `productId` is the product's own URL slug, so it reads well as a name.
      productId.replace(/-/g, ' ').replace(/^\p{Ll}/u, (letter) => letter.toUpperCase())

  return {
    title: `${name} — ${shelf}`,
    description: t('description', { name, shelf: shelf.toLowerCase() }),
    alternates: languageAlternates(`/${type}/${productId}`, locale),
    openGraph: {
      type: 'website',
      title: `${name} — ${shelf}`,
      url: localizedPath(`/${type}/${productId}`, locale),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; type: string; productId: string }>
}) {
  const { locale, type, productId } = await params
  setRequestLocale(locale)
  return <ProductDetail urlName={`/${type}/${productId}`} typeId={type} />
}
