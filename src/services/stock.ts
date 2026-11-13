import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Order, StockLine, StockMovement } from '@/lib/types'
import { UsersService } from './users'

const productsRef = collection(db, 'products')
const ordersRef = collection(db, 'orders')
const movementsRef = (productId: string) =>
  collection(db, 'products', productId, 'stockMovements')

export type StockKind = StockMovement['type']

const describe = (kind: StockKind, lines: StockLine[]) =>
  `${kind === 'withdrawal' ? 'Retirada de produtos do estoque' : 'Devolução de produtos ao estoque'}: ${lines
    .map((line) => `${line.quantity}× ${line.name}`)
    .join(', ')}`

/** Adds `delta` to the line with the same id, dropping lines that reach zero. */
const mergeOutstanding = (current: StockLine[], lines: StockLine[], sign: 1 | -1) => {
  const next = new Map(current.map((line) => [line.id, { ...line }]))
  for (const line of lines) {
    const found = next.get(line.id)
    const quantity = (found?.quantity ?? 0) + sign * line.quantity
    if (quantity > 0) next.set(line.id, { id: line.id, name: line.name, quantity })
    else next.delete(line.id)
  }
  return [...next.values()]
}

export const StockService = {
  /** Current stock per product id (missing products are left out). */
  async getStock(ids: string[]): Promise<Record<string, number>> {
    const entries = await Promise.all(
      ids.map(async (id) => {
        const snap = await getDoc(doc(productsRef, id))
        return snap.exists() ? ([id, Number(snap.data().amount) || 0] as const) : null
      }),
    )
    return Object.fromEntries(entries.filter((entry) => entry !== null))
  },

  async getHistory(productId: string): Promise<StockMovement[]> {
    const snapshot = await getDocs(
      query(movementsRef(productId), orderBy('createdAt', 'desc')),
    )
    return snapshot.docs.map((entry) => ({
      ...(entry.data() as StockMovement),
      id: entry.id,
    }))
  },

  /**
   * Takes products out of (or puts them back into) stock for an order. Stock,
   * each product's history and the order's own record change in one
   * transaction, so they can never disagree.
   */
  async move(order: Order, kind: StockKind, lines: StockLine[]): Promise<void> {
    const wanted = lines.filter((line) => line.quantity > 0)
    if (wanted.length === 0) throw new Error('Nenhum produto informado')

    const user = UsersService.getStoredUser()
    const userName = user?.name ?? '—'
    const now = new Date().toISOString()

    await runTransaction(db, async (tx) => {
      const orderRef = doc(ordersRef, order.id)
      const orderSnap = await tx.get(orderRef)
      if (!orderSnap.exists()) throw new Error('Pedido não encontrado')
      const current = orderSnap.data() as Order
      const outstanding = current.stockWithdrawn ?? []

      if (kind === 'return') {
        for (const line of wanted) {
          const taken = outstanding.find((entry) => entry.id === line.id)?.quantity ?? 0
          if (line.quantity > taken) {
            throw new Error(`${line.name}: só ${taken} retirado(s) neste pedido`)
          }
        }
      }

      const productSnaps = await Promise.all(
        wanted.map((line) => tx.get(doc(productsRef, line.id))),
      )

      const sign = kind === 'withdrawal' ? -1 : 1
      wanted.forEach((line, index) => {
        const snap = productSnaps[index]
        if (!snap.exists()) throw new Error(`Produto não encontrado: ${line.name}`)
        const stock = Number(snap.data().amount) || 0
        const balance = Math.max(0, stock + sign * line.quantity)

        tx.update(snap.ref, { amount: balance })
        tx.set(doc(movementsRef(line.id)), {
          type: kind,
          quantity: line.quantity,
          balanceAfter: balance,
          userName,
          createdAt: now,
          orderNumber: order.orderId,
          orderRef: order.id,
        } satisfies Omit<StockMovement, 'id'>)
      })

      tx.update(orderRef, {
        stockWithdrawn: mergeOutstanding(
          outstanding,
          wanted,
          kind === 'withdrawal' ? 1 : -1,
        ),
        updatedAt: now,
        comments: [
          ...(current.comments ?? []),
          { userName, comment: describe(kind, wanted), createdAt: now },
        ],
      })
    })
  },
}
