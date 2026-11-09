import { ORDER_STATUS } from './constants'
import { toDate } from './format'
import type { Order } from './types'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export interface OrderKpis {
  total: number
  /** Média de horas entre a entrada e a primeira mudança de status (saída de "Em espera"). */
  avgFirstResponseMs: number | null
  firstResponseSample: number
  /** Média de horas entre a entrada e "Finalizado", sem cancelados. */
  avgCloseMs: number | null
  closeSample: number
  waiting: number
  open: number
  finalized: number
  canceled: number
  /** 0–1, sobre o total considerado. */
  cancelRate: number
  /** Pedidos abertos sem mudança de status há mais de 2 dias. */
  stale: number
  shippingShare: number | null
  topProducts: { name: string; amount: number }[]
}

const average = (values: number[]): number | null =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null

const sortedLogs = (order: Order) =>
  (order.statusLogs ?? [])
    .map((log) => ({ ...log, at: toDate(log.updatedAt) }))
    .filter((log): log is typeof log & { at: Date } => log.at !== null)
    .sort((a, b) => a.at.getTime() - b.at.getTime())

export function computeOrderKpis(orders: Order[], now: Date = new Date()): OrderKpis {
  const responseTimes: number[] = []
  const closeTimes: number[] = []
  const products = new Map<string, number>()
  let waiting = 0
  let open = 0
  let finalized = 0
  let canceled = 0
  let stale = 0
  let shipping = 0

  for (const order of orders) {
    const created = toDate(order.createdAt)
    const logs = sortedLogs(order)

    if (order.status === ORDER_STATUS.CANCELADO) {
      canceled += 1
    } else {
      if (order.status === ORDER_STATUS.FINALIZADO) finalized += 1
      else open += 1
      if (order.status === ORDER_STATUS.EM_ESPERA) waiting += 1

      if (order.delivery?.method === 'shipping') shipping += 1
      for (const item of order.items ?? []) {
        products.set(item.name, (products.get(item.name) ?? 0) + (item.amount || 0))
      }

      const lastChange = logs.at(-1)?.at ?? created
      if (
        order.status !== ORDER_STATUS.FINALIZADO &&
        lastChange &&
        now.getTime() - lastChange.getTime() > 2 * DAY_MS
      ) {
        stale += 1
      }

      const closedAt = [...logs]
        .reverse()
        .find((log) => log.newStatus === ORDER_STATUS.FINALIZADO)?.at
      if (created && closedAt && closedAt >= created) {
        closeTimes.push(closedAt.getTime() - created.getTime())
      }
    }

    // First reply counts even for orders later canceled: the team did answer.
    const firstChange = logs[0]?.at
    if (created && firstChange && firstChange >= created) {
      responseTimes.push(firstChange.getTime() - created.getTime())
    }
  }

  const active = orders.length - canceled

  return {
    total: orders.length,
    avgFirstResponseMs: average(responseTimes),
    firstResponseSample: responseTimes.length,
    avgCloseMs: average(closeTimes),
    closeSample: closeTimes.length,
    waiting,
    open,
    finalized,
    canceled,
    cancelRate: orders.length ? canceled / orders.length : 0,
    stale,
    shippingShare: active ? shipping / active : null,
    topProducts: [...products.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3),
  }
}

/** "3 h 20 min", "2 d 4 h" — a duration a volunteer can read at a glance. */
export function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rest = minutes % 60
    return rest ? `${hours} h ${rest} min` : `${hours} h`
  }
  const days = Math.floor(hours / 24)
  const restHours = hours % 24
  return restHours ? `${days} d ${restHours} h` : `${days} d`
}

export const formatPercent = (share: number | null): string =>
  share === null ? '—' : `${Math.round(share * 100)}%`

/**
 * How long the order has been in its current status: since the last status
 * change, or since it came in if it never changed. `null` when the dates are
 * unusable.
 */
export function timeInCurrentStatus(order: Order, now: Date = new Date()): number | null {
  const since = sortedLogs(order).at(-1)?.at ?? toDate(order.createdAt)
  if (!since) return null
  const elapsed = now.getTime() - since.getTime()
  return elapsed >= 0 ? elapsed : null
}
