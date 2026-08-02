import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ORDER_STATUS } from '@/lib/constants'
import type { Cart, CartItem, ContactInfo, Coupon, Order } from '@/lib/types'
import { EmailSender } from './email'
import { orderMailList } from './maillist'
import { UsersService } from './users'

const ordersRef = collection(db, 'orders')

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

export const OrdersService = {
  async getOrders(statusToFilter = ''): Promise<Order[]> {
    const snapshot = await getDocs(
      statusToFilter
        ? query(ordersRef, orderBy('orderId'), where('status', '==', statusToFilter))
        : query(ordersRef, orderBy('orderId')),
    )
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Order)
  },

  async getOrderById(orderId: number | string): Promise<Order> {
    const snapshot = await getDocs(
      query(ordersRef, where('orderId', '==', Number(orderId))),
    )
    if (snapshot.empty) throw new Error('Pedido não encontrado')
    const first = snapshot.docs[0]
    return { id: first.id, ...first.data() } as Order
  },

  async saveOrder(
    cart: Cart,
    contactInfo: ContactInfo,
    coupon?: Coupon,
  ): Promise<number> {
    const lastOrder = (await OrdersService.getOrders()).pop()
    const orderNumber = lastOrder ? Number(lastOrder.orderId) + 1 : 0

    await addDoc(ordersRef, {
      items: cart.items
        .filter((item) => item.amount)
        .map((item) => ({
          id: item.id,
          amount: item.amount,
          name: item.name,
          price: item.price,
          type: item.type,
        })),
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

    // Best effort: a failed notification must not lose a confirmed order.
    try {
      await EmailSender.sendNewOrderEmail(orderNumber, contactInfo.name, orderMailList)
    } catch (error) {
      console.error('Falha ao notificar a equipe sobre o novo pedido', error)
    }

    return orderNumber
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
