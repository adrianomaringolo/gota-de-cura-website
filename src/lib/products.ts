import { addMonths, isAfter } from 'date-fns'
import { toDate } from './format'
import type { CartItem, ProductItem } from './types'

/** How long a product keeps the "Novo" tag after it is created. */
export const NEW_PRODUCT_WINDOW_MONTHS = 1

/**
 * A product is new for one calendar month after its creation date. Products
 * saved before `createdAt` existed simply never carry the tag.
 */
export const isNewProduct = (
  product: Pick<ProductItem, 'createdAt'>,
  now: Date = new Date(),
): boolean => {
  const created = toDate(product.createdAt)
  if (!created) return false
  return isAfter(addMonths(created, NEW_PRODUCT_WINDOW_MONTHS), now)
}

const filled = (value: string | undefined) => (value?.trim() ? value : undefined)

/**
 * The product as a visitor in `locale` reads it. Each field falls back to the
 * Portuguese on its own, so a half-translated product still shows a full card.
 * Display only: carts, orders and saves keep working with the original.
 */
export const localizeProduct = <T extends ProductItem>(product: T, locale: string): T => {
  const translation = locale === 'en' ? product.translations?.en : undefined
  if (!translation) return product

  return {
    ...product,
    name: filled(translation.name) ?? product.name,
    description: filled(translation.description) ?? product.description,
    detailedDescription:
      filled(translation.detailedDescription) ?? product.detailedDescription,
  }
}

/**
 * A cart line's name in `locale`. The stored `name` is the Portuguese one with
 * the chosen options appended — that is what the order records — so the
 * translated name gets the same options appended here.
 */
export const cartLineName = (line: CartItem, locale: string): string => {
  const translated = locale === 'en' ? filled(line.translations?.en?.name) : undefined
  if (!translated) return line.name
  return line.variants?.length
    ? `${translated} (${line.variants.join(', ')})`
    : translated
}
