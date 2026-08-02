'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { ProductsService } from '@/services/products'
import type { CartItem, ProductItem } from './types'

const CART_KEY = 'cart'

type CartContextValue = {
  items: CartItem[]
  /** Total units in the cart — what the header badge shows. */
  count: number
  total: number
  ready: boolean
  addItem: (item: ProductItem, type: string, variantSuffix?: string[]) => void
  setAmount: (id: string, amount: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const readStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { items?: CartItem[] }
    // Legacy carts were seeded with every product at amount 0.
    return (parsed.items ?? []).filter((item) => item && item.amount > 0)
  } catch {
    return []
  }
}

const writeStoredCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify({ items }))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStoredCart()
    setItems(stored)
    setReady(true)

    if (stored.length === 0) return

    // Prices can change between visits; the cart always shows today's price.
    let cancelled = false
    ProductsService.getProducts()
      .then((products) => {
        if (cancelled) return
        setItems((current) => {
          const refreshed = current.map((item) => {
            const product = products.find((candidate) => candidate.id === item.id)
            return product ? { ...item, price: product.price } : item
          })
          writeStoredCart(refreshed)
          return refreshed
        })
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback((next: CartItem[]) => {
    setItems(next)
    writeStoredCart(next)
  }, [])

  const addItem = useCallback(
    (item: ProductItem, type: string, variantSuffix?: string[]) => {
      const name = variantSuffix?.length
        ? `${item.name} (${variantSuffix.join(', ')})`
        : item.name
      // Variants of the same product are distinct lines in the order.
      const lineId = variantSuffix?.length
        ? `${item.id}::${variantSuffix.join('-')}`
        : item.id

      setItems((current) => {
        const existing = current.find((line) => line.id === lineId)
        const next = existing
          ? current.map((line) =>
              line.id === lineId ? { ...line, amount: line.amount + 1 } : line,
            )
          : [...current, { ...item, id: lineId, name, type, amount: 1 }]
        writeStoredCart(next)
        return next
      })

      toast.success(`${name} foi para o seu pedido`)
    },
    [],
  )

  const setAmount = useCallback((id: string, amount: number) => {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0
    setItems((current) => {
      const next = current.map((line) =>
        line.id === id ? { ...line, amount: safeAmount } : line,
      )
      writeStoredCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const next = current.filter((line) => line.id !== id)
      writeStoredCart(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    update([])
  }, [update])

  const value = useMemo<CartContextValue>(() => {
    const active = items.filter((item) => item.amount > 0)
    return {
      items,
      count: active.reduce((sum, item) => sum + item.amount, 0),
      total: active.reduce((sum, item) => sum + item.price * item.amount, 0),
      ready,
      addItem,
      setAmount,
      removeItem,
      clear,
    }
  }, [items, ready, addItem, setAmount, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return context
}
