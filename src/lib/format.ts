import { isValid } from 'date-fns'

const SP_TIMEZONE = 'America/Sao_Paulo'

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)

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

const toDate = (value: unknown): Date | null => {
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

/**
 * Visit dates are stored as plain calendar days. Rendering them in the
 * browser's local zone shifts them a day for anyone west of São Paulo, so they
 * are always formatted in the chácara's own timezone.
 */
export const formatVisitDate = (value: unknown): string => {
  const date = toDate(value)
  return date
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone: SP_TIMEZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    : ''
}

export const formatVisitDateLong = (value: unknown): string => {
  const date = toDate(value)
  return date
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone: SP_TIMEZONE,
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date)
    : ''
}

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
