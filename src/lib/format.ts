import { isValid } from 'date-fns'

const SP_TIMEZONE = 'America/Sao_Paulo'

/**
 * Firestore is not schema-enforced and a few legacy products carry `price` as a
 * string ("40"). Services normalise on read so nothing downstream has to care.
 * A lone comma is treated as the decimal separator, which is how a price typed
 * by hand in pt-BR arrives; thousands separators are not guessed at.
 */
export const toAmount = (value: unknown): number => {
  const parsed =
    typeof value === 'string' ? Number(value.trim().replace(',', '.')) : Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Goes through `toAmount` on purpose: `Number.isFinite` does not convert, so a
 * price stored as the string "40" used to fall through to the 0 fallback and
 * render as R$ 0,00. Services normalise on read, and sharing the coercion keeps
 * this last line of defence from disagreeing with them.
 */
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(toAmount(value))

export const formatDateAndTime = (date: Date): string =>
  isValid(date)
    ? new Intl.DateTimeFormat('pt-BR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    : ''

export const formatMonthAndYear = (date: Date): string =>
  isValid(date)
    ? new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: 'long' }).format(date)
    : ''

/** Accepts ISO strings, epoch numbers, Dates and Firestore Timestamps alike. */
export const toDate = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return isValid(value) ? value : null
  if (typeof value === 'object' && 'seconds' in (value as Record<string, unknown>)) {
    return new Date((value as { seconds: number }).seconds * 1000)
  }
  const parsed = new Date(value as string | number)
  return isValid(parsed) ? parsed : null
}

export const formatDate = (value: unknown): string => {
  const date = toDate(value)
  return date
    ? new Intl.DateTimeFormat('pt-BR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    : ''
}

/** A bare calendar day, e.g. "2026-08-01" — how visit and post dates are stored. */
const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/

/**
 * A calendar day is not a moment in time, so no zone conversion can be right:
 * `new Date('2026-08-01')` lands on midnight *UTC*, and rendering that in São
 * Paulo (UTC-3) walks it back to 31/07. Pinning the format to UTC echoes the
 * stored day verbatim in every browser zone. A real instant (a Firestore
 * Timestamp, a full ISO datetime) still reads in the chácara's zone.
 */
export const formatCalendarDay = (
  value: unknown,
  options: Intl.DateTimeFormatOptions,
): string => {
  const date = toDate(value)
  if (!date) return ''

  const isPlainDay = typeof value === 'string' && CALENDAR_DAY.test(value.trim())

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: isPlainDay ? 'UTC' : SP_TIMEZONE,
    ...options,
  }).format(date)
}

export const formatVisitDate = (value: unknown): string =>
  formatCalendarDay(value, { day: '2-digit', month: '2-digit', year: 'numeric' })

export const formatVisitDateLong = (value: unknown): string =>
  formatCalendarDay(value, { day: '2-digit', month: 'long', year: 'numeric' })

/** "2 de agosto de 2026" — the byline date on a blog post. */
export const formatPostDate = (value: unknown): string =>
  formatCalendarDay(value, { day: 'numeric', month: 'long', year: 'numeric' })

/** "ago 2026" — the compact form used in post listings. */
export const formatPostDateShort = (value: unknown): string =>
  formatCalendarDay(value, { month: 'short', year: 'numeric' })

/** "(19) 99999-9999" as the visitor types. */
export const maskPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, '($1')
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

/** "13.024-000" */
export const maskZipcode = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? digits.replace(/^(\d{5})(\d{0,3})/, '$1-$2') : digits
}
