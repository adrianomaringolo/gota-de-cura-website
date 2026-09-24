import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ORDER_STATUS } from '@/lib/constants'
import { toAmount } from '@/lib/format'
import { SITE } from '@/lib/site'
import type { Cart, CartItem, ContactInfo, Coupon, Order } from '@/lib/types'
import { EmailSender } from './email'
import { orderMailList } from './maillist'
import { UsersService } from './users'

const ordersRef = collection(db, 'orders')

/**
 * Orders placed before product prices were normalised recorded `price` as a
 * string. The totals happened to survive because `*` coerces, but the unit
 * price rendered as R$ 0,00 — so the stored line items are normalised on read
 * too. Values only change type here, never magnitude.
 */
const toOrder = (id: string, data: Record<string, unknown>): Order => {
  const order = { id, ...data } as Order

  return {
    ...order,
    items: order.items?.map((item) => ({
      ...item,
      price: toAmount(item.price),
      amount: toAmount(item.amount),
    })),
    ...(order.coupon
      ? { coupon: { ...order.coupon, discount: toAmount(order.coupon.discount) } }
      : {}),
  }
}

export const orderTotal = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.price * (item.amount || 0), 0)

export const couponDiscount = (
  total: number,
  coupon?: { discount: number; discountType: 'percentage' | 'fixed' } | '' | null,
): number => {
  if (!coupon || !coupon.discount) return 0
  return coupon.discountType === 'fixed'
    ? coupon.discount
    : (total * coupon.discount) / 100
}

/**
 * The customer-facing tracking link uses the Firestore document id, not the
 * sequential `orderId` shown in admin — the doc id is unguessable, so sharing
 * it does not let anyone browse other people's orders.
 */
export const publicOrderUrl = (orderRef: string): string => `${SITE.url}/pedidos/${orderRef}`

export const OrdersService = {
  async getOrders(statusToFilter = ''): Promise<Order[]> {
    const snapshot = await getDocs(
      statusToFilter
        ? query(ordersRef, orderBy('orderId'), where('status', '==', statusToFilter))
        : query(ordersRef, orderBy('orderId')),
    )
    return snapshot.docs.map((entry) => toOrder(entry.id, entry.data()))
  },

  async getOrderById(orderId: number | string): Promise<Order> {
    const snapshot = await getDocs(
      query(ordersRef, where('orderId', '==', Number(orderId))),
    )
    if (snapshot.empty) throw new Error('Pedido não encontrado')
    const first = snapshot.docs[0]
    return toOrder(first.id, first.data())
  },

  /** Looks an order up by its Firestore document id, the token in the public tracking link. */
  async getPublicOrder(orderRef: string): Promise<Order> {
    const snapshot = await getDoc(doc(ordersRef, orderRef))
    if (!snapshot.exists()) throw new Error('Pedido não encontrado')
    return toOrder(snapshot.id, snapshot.data())
  },

  async saveOrder(
    cart: Cart,
    contactInfo: ContactInfo,
    coupon?: Coupon,
  ): Promise<{ orderNumber: number; orderRef: string }> {
    const lastOrder = (await OrdersService.getOrders()).pop()
    const orderNumber = lastOrder ? Number(lastOrder.orderId) + 1 : 0
    const items = cart.items
      .filter((item) => item.amount)
      .map((item) => ({
        id: item.id,
        amount: item.amount,
        name: item.name,
        price: item.price,
        type: item.type,
      }))

    const docRef = await addDoc(ordersRef, {
      items,
      orderId: orderNumber,
      coupon: coupon
        ? {
            number: coupon.code,
            discount: coupon.discount,
            discountType: coupon.discountType,
          }
        : '',
      contactInfo,
      status: ORDER_STATUS.EM_ESPERA,
      createdAt: new Date().toISOString(),
    })

    const orderUrl = publicOrderUrl(docRef.id)

    // Best effort: a failed notification must not lose a confirmed order.
    try {
      await EmailSender.sendNewOrderEmail(orderNumber, contactInfo.name, orderMailList)
    } catch (error) {
      console.error('Falha ao notificar a equipe sobre o novo pedido', error)
    }

    if (contactInfo.email) {
      try {
        await EmailSender.sendOrderConfirmationEmail(
          orderNumber,
          contactInfo,
          items,
          orderUrl,
        )
      } catch (error) {
        console.error('Falha ao enviar e-mail de confirmação ao cliente', error)
      }
    }

    return { orderNumber, orderRef: docRef.id }
  },

  async editOrderStatus(order: Order, newStatus: string): Promise<void> {
    const user = UsersService.getStoredUser()

    await updateDoc(doc(ordersRef, order.id), {
      updatedAt: new Date().toISOString(),
      status: newStatus,
      statusLogs: [
        ...(order.statusLogs || []),
        {
          userName: user?.name ?? '—',
          oldStatus: order.status || '',
          newStatus,
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  },

  async addCommentToOrder(order: Order, comment: string): Promise<void> {
    const user = UsersService.getStoredUser()

    await updateDoc(doc(ordersRef, order.id), {
      comments: [
        ...(order.comments || []),
        {
          userName: user?.name ?? '—',
          comment,
          createdAt: new Date().toISOString(),
        },
      ],
    })
  },
}
