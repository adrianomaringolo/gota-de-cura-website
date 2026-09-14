import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '@/lib/constants'
import { toDate } from '@/lib/format'
import type { Order, OrderStatusLog, User } from '@/lib/types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Um pedido é considerado "parado" após este tempo sem mudança de status. */
export const STALE_AFTER_DAYS = 2

/**
 * Status que ainda esperam uma ação da equipe. `finalizado` e `cancelado` são
 * desfechos — um pedido nesses status pode ficar quieto para sempre e não gera
 * aviso.
 */
const OPEN_STATUSES = [
  ORDER_STATUS.EM_ESPERA,
  ORDER_STATUS.EM_ANDAMENTO,
  ORDER_STATUS.APROVADO,
  ORDER_STATUS.PAGO,
  ORDER_STATUS.SEPARADO,
  ORDER_STATUS.EM_FINALIZACAO,
] as const

const STATUS_LABEL = new Map(
  ORDER_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

/**
 * Registro do que a rotina já avisou sobre um pedido, gravado no próprio
 * documento. Sem isso a rotina reenviaria o mesmo aviso todo dia.
 */
export interface StaleNotifyState {
  /** ISO da mudança de status que motivou os avisos já enviados. */
  forChangeAt: string
  /** ISO do último aviso enviado. */
  lastNotifiedAt: string
  /** Quantos blocos de STALE_AFTER_DAYS dias já foram avisados neste período. */
  count: number
}

type StoredOrder = Order & { updatedAt?: string; staleNotify?: StaleNotifyState }

export interface StaleOrder {
  order: StoredOrder
  /** Momento da última mudança de status (ou da criação, se nunca mudou). */
  lastChangeAt: Date
  /** Dias inteiros desde a última mudança. */
  daysStale: number
  /** Blocos completos de STALE_AFTER_DAYS dias desde a última mudança. */
  blocksStale: number
  /** Nome de quem mexeu no status por último, ou `null` se não há histórico. */
  responsibleName: string | null
  /** Rótulo legível do status atual. */
  statusLabel: string
}

/** A entrada mais recente do histórico, tolerando ordem/datas inválidas. */
function latestStatusLog(order: Order): OrderStatusLog | null {
  return (order.statusLogs ?? []).reduce<OrderStatusLog | null>((latest, log) => {
    const at = toDate(log.updatedAt)
    if (!at) return latest
    const latestAt = latest && toDate(latest.updatedAt)
    return !latestAt || at > latestAt ? log : latest
  }, null)
}

/**
 * Quando o status mudou pela última vez e quem mudou. Um pedido sem histórico
 * conta a partir da criação, sem responsável identificado.
 */
function lastStatusChange(order: Order): { at: Date; by: string | null } | null {
  const log = latestStatusLog(order)
  if (log) {
    const at = toDate(log.updatedAt)
    if (at) return { at, by: log.userName?.trim() || null }
  }
  const created = toDate(order.createdAt)
  return created ? { at: created, by: null } : null
}

/**
 * Lê a coleção `orders` e devolve os pedidos abertos que estão há
 * STALE_AFTER_DAYS dias ou mais sem mudança de status e que ainda não foram
 * avisados sobre o bloco de dias em que se encontram.
 */
export async function collectStaleOrders(now: Date = new Date()): Promise<StaleOrder[]> {
  // `in` corta a leitura para os poucos pedidos abertos — a coleção tem
  // milhares de pedidos finalizados que não interessam aqui.
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('status', 'in', [...OPEN_STATUSES])),
  )
  const stale: StaleOrder[] = []

  for (const entry of snapshot.docs) {
    const order = { id: entry.id, ...entry.data() } as StoredOrder

    const change = lastStatusChange(order)
    if (!change) continue

    const elapsed = now.getTime() - change.at.getTime()
    const blockMs = STALE_AFTER_DAYS * DAY_MS
    if (elapsed < blockMs) continue

    const blocksStale = Math.floor(elapsed / blockMs)
    const alreadySent =
      order.staleNotify?.forChangeAt === change.at.toISOString()
        ? order.staleNotify.count
        : 0
    if (blocksStale <= alreadySent) continue

    stale.push({
      order,
      lastChangeAt: change.at,
      daysStale: Math.floor(elapsed / DAY_MS),
      blocksStale,
      responsibleName: change.by,
      statusLabel: STATUS_LABEL.get(order.status) ?? order.status,
    })
  }

  return stale
}

/**
 * Mapa `nome (minúsculas) → e-mail` da coleção `users`, para descobrir o e-mail
 * de quem mexeu no status por último.
 */
export async function loadTeamDirectory(): Promise<Map<string, string>> {
  const snapshot = await getDocs(query(collection(db, 'users')))
  const directory = new Map<string, string>()

  for (const entry of snapshot.docs) {
    const user = entry.data() as Partial<User>
    const name = typeof user.name === 'string' ? user.name.trim().toLowerCase() : ''
    const email = typeof user.email === 'string' ? user.email.trim() : ''
    if (name && email.includes('@')) directory.set(name, email)
  }

  return directory
}

/**
 * Para quem o aviso vai: o e-mail de quem mexeu no status por último quando dá
 * para identificá-lo, senão a lista da equipe.
 */
export function pickRecipients(
  responsibleName: string | null,
  directory: Map<string, string>,
  fallback: string[],
): { to: string[]; usedFallback: boolean } {
  if (responsibleName) {
    const email = directory.get(responsibleName.trim().toLowerCase())
    if (email) return { to: [email], usedFallback: false }
  }
  return { to: fallback, usedFallback: true }
}

/** Assunto e corpo do e-mail de pedido parado, no template `gota-de-cura-email`. */
export function buildStaleOrderEmail(entry: StaleOrder): { title: string; html: string } {
  const { order, daysStale, statusLabel, lastChangeAt, responsibleName } = entry
  const clientName = order.contactInfo?.name ?? '—'
  const orderUrl = `https://gotadecura.com.br/admin/pedidos/${order.orderId}`
  const changedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(lastChangeAt)

  return {
    title: `⏰ Pedido #${order.orderId} parado há ${daysStale} dias`,
    html: `<p style="font-size: 20px">O pedido <strong>#${order.orderId}</strong> de&nbsp;<strong>${clientName}</strong> está há <strong>${daysStale} dias</strong> sem mudança de status.</p>
      <hr>
      <p><b>Status atual:</b> ${statusLabel}</p>
      <p><b>Última mudança:</b> ${changedAt}${responsibleName ? ` por ${responsibleName}` : ' (na criação do pedido)'}</p>
      <p>Abra o pedido para dar andamento:<br>
      <a style="color: #4c3b82" href="${orderUrl}" target="_blank" rel="noopener">${orderUrl}</a></p>`,
  }
}

/** Grava no pedido que o bloco de dias atual já foi avisado. */
export async function markNotified(
  entry: StaleOrder,
  now: Date = new Date(),
): Promise<void> {
  const state: StaleNotifyState = {
    forChangeAt: entry.lastChangeAt.toISOString(),
    lastNotifiedAt: now.toISOString(),
    count: entry.blocksStale,
  }
  await updateDoc(doc(collection(db, 'orders'), entry.order.id), { staleNotify: state })
}
