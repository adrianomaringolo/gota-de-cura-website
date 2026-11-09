import { ORDER_STATUS } from './constants'
import { toDate } from './format'
import type { Order } from './types'

export interface Customer {
  /** Grouping key: the phone, or the e-mail / name when no usable phone exists. */
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

const customerKey = (order: Order): string => {
  const byPhone = phoneKey(order.contactInfo?.phone)
  if (byPhone) return byPhone

  const email = order.contactInfo?.email?.trim().toLowerCase()
  if (email) return `mail:${email}`

  return `name:${nameKey(order.contactInfo?.name ?? '')}`
}

const time = (order: Order) => toDate(order.createdAt)?.getTime() ?? 0

export function groupByCustomer(orders: Order[]): Customer[] {
  const groups = new Map<string, Order[]>()
  for (const order of orders) {
    const key = customerKey(order)
    groups.set(key, [...(groups.get(key) ?? []), order])
  }

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
