import { addMonths, isAfter } from 'date-fns'
import { toDate } from './format'
import type { ProductItem } from './types'

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
