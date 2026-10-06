import type { AbstractIntlMessages } from 'next-intl'

/**
 * Namespaces read by client components — or by server components rendered
 * inside a client tree (Wordmark in the header, PostCard in the post list,
 * PaymentTerms in the sign-up form). Only these are serialised into the page;
 * server components read the rest straight from the request config.
 *
 * Add a namespace here when a client component starts using it, or that
 * component will throw a missing-message error in the browser.
 */
const CLIENT_NAMESPACES = [
  'cart',
  'checkout',
  'chromatography',
  'common',
  'coupon',
  'enrollment',
  'gallery',
  'header',
  'laudos',
  'launches',
  'orderStatus',
  'paymentTerms',
  'post',
  'postList',
  'product',
  'productList',
  'testimonies',
  'ui',
  'videos',
  'visitDates',
  'visitPhotos',
  'visitPrices',
  'visitVideo',
] as const

export const clientMessages = (messages: AbstractIntlMessages): AbstractIntlMessages =>
  Object.fromEntries(
    CLIENT_NAMESPACES.filter((namespace) => namespace in messages).map((namespace) => [
      namespace,
      messages[namespace],
    ]),
  )
