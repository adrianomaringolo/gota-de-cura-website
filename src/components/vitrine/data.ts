'use client'

import { useEffect, useState } from 'react'
import { productTypes } from '@/lib/product-types'
import type { ProductItem, ProductType } from '@/lib/types'
import { ProductsService } from '@/services/products'

/** One catalogue shelf with the products that belong to it, sold-out last. */
export interface Shelf {
  type: ProductType
  items: ProductItem[]
}

/** Firestore joins category-mode shelves through an array the type doesn't declare. */
type WithCategories = ProductItem & { categories?: string[] }

const belongs = (item: ProductItem, type: ProductType) =>
  type.mode === 'category'
    ? Boolean((item as WithCategories).categories?.includes(type.type))
    : item.type === type.type

const availableFirst = (a: ProductItem, b: ProductItem) =>
  Number(Boolean(b.available)) - Number(Boolean(a.available))

const toShelves = (all: ProductItem[]): Shelf[] => {
  const visible = all.filter((item) => !item.hidden)

  return productTypes
    .map((type) => ({
      type,
      items: visible.filter((item) => belongs(item, type)).sort(availableFirst),
    }))
    .filter((shelf) => shelf.items.length > 0)
}

type State =
  { status: 'loading' } | { status: 'ready'; shelves: Shelf[] } | { status: 'error' }

/**
 * The whole catalogue is pulled once so the kiosk never waits again — every
 * shelf tap and every product is already in hand, which is what keeps the
 * navigation feeling immediate under a counter.
 */
export function useCatalogue(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    ProductsService.getProducts()
      .then((all) => {
        if (!cancelled) setState({ status: 'ready', shelves: toShelves(all) })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/** Category labels carry markup (`<br/>`, `<small>`) and descriptions are rich text. */
export const plainText = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()

export const shelfLabel = (type: ProductType) => plainText(type.typeLabel ?? type.type)

/** Accent- and case-folded text, so "hortela" matches "Hortelã" in search. */
export const foldText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .trim()

export const countLabel = (n: number) => `${n} ${n === 1 ? 'produto' : 'produtos'}`

/** Option values are stored either as an array or a comma-joined string. */
export const readValues = (values: string[] | string) =>
  (typeof values === 'string' ? values.split(',') : values)
    .map((value) => value.trim())
    .filter(Boolean)
