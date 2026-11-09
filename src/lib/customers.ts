import { ORDER_STATUS } from './constants'
import { toDate } from './format'
import type { Order } from './types'

export interface Customer {
  /** Grouping key (one of the customer's identifiers). */
  key: string
  /** The most recent spelling of the name. */
  name: string
  /** Other spellings seen across the orders, without the main one. */
  aliases: string[]
  phone: string
  email?: string
  /** Newest first. */
  orders: Order[]
  /** Orders that were not canceled. */
  validOrders: number
  canceledOrders: number
  lastOrderAt: Date | null
}

/**
 * Brazilian numbers are typed every which way: "(19) 99999-1234", "+55 19
 * 999991234", "19 9999-1234" (no ninth digit). Digits only, country code
 * dropped, then area code + last 8 digits — which is what stays the same
 * whether or not the ninth digit was typed.
 */
export function phoneKey(phone: string | undefined): string | null {
  let digits = (phone ?? '').replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2)
  if (digits.length < 10) return null
  return `tel:${digits.slice(0, 2)}${digits.slice(-8)}`
}

/** "  JOÃO  da Silva" and "joao da silva" count as the same spelling. */
const nameKey = (name: string) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * Every identifier an order carries. Orders sharing any one of them belong to
 * the same customer: a mistyped digit in the phone is bridged by the e-mail,
 * and a different e-mail by the phone. The name is only a last resort, for
 * orders with neither.
 */
const identifiers = (order: Order): string[] => {
  const keys: string[] = []

  const byPhone = phoneKey(order.contactInfo?.phone)
  if (byPhone) keys.push(byPhone)

  const email = order.contactInfo?.email?.trim().toLowerCase()
  if (email) keys.push(`mail:${email}`)

  return keys.length ? keys : [`name:${nameKey(order.contactInfo?.name ?? '')}`]
}

const time = (order: Order) => toDate(order.createdAt)?.getTime() ?? 0

export function groupByCustomer(orders: Order[]): Customer[] {
  // Union-find over identifiers: all identifiers of one order end up together.
  const parent = new Map<string, string>()
  const find = (key: string): string => {
    const up = parent.get(key) ?? key
    if (up === key) return key
    const root = find(up)
    parent.set(key, root)
    return root
  }
  const union = (a: string, b: string) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent.set(rootB, rootA)
  }

  const keysByOrder = orders.map(identifiers)
  keysByOrder.forEach((keys) => {
    keys.forEach((key) => parent.has(key) || parent.set(key, key))
    keys.slice(1).forEach((key) => union(keys[0], key))
  })

  const groups = new Map<string, Order[]>()
  orders.forEach((order, index) => {
    const key = find(keysByOrder[index][0])
    groups.set(key, [...(groups.get(key) ?? []), order])
  })

  return [...groups.entries()]
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => time(b) - time(a))
      const latest = sorted[0]
      const name = latest.contactInfo?.name?.trim() || '—'

      // Distinct by normalised form, keeping the first spelling met.
      const seen = new Set([nameKey(name)])
      const aliases: string[] = []
      for (const order of sorted) {
        const other = order.contactInfo?.name?.trim()
        if (other && !seen.has(nameKey(other))) {
          seen.add(nameKey(other))
          aliases.push(other)
        }
      }

      const canceled = sorted.filter(
        (order) => order.status === ORDER_STATUS.CANCELADO,
      ).length

      return {
        key,
        name,
        aliases,
        phone: latest.contactInfo?.phone ?? '',
        email: sorted.find((order) => order.contactInfo?.email)?.contactInfo.email,
        orders: sorted,
        validOrders: sorted.length - canceled,
        canceledOrders: canceled,
        lastOrderAt: toDate(latest.createdAt),
      }
    })
    .sort((a, b) => (b.lastOrderAt?.getTime() ?? 0) - (a.lastOrderAt?.getTime() ?? 0))
}
