import { isValid } from 'date-fns';
const SP_TIMEZONE = 'America/Sao_Paulo';
/**
 * Firestore is not schema-enforced and a few legacy products carry `price` as a
 * string ("40"). Services normalise on read so nothing downstream has to care.
 * A lone comma is treated as the decimal separator, which is how a price typed
 * by hand in pt-BR arrives; thousands separators are not guessed at.
 */
export const toAmount = (value) => {
    const parsed = typeof value === 'string' ? Number(value.trim().replace(',', '.')) : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
/**
 * Coerces before guarding on purpose: `Number.isFinite` does not convert, so a
 * price stored as the string "40" used to fall through to the 0 fallback and
 * render as R$ 0,00. Documents are normalised on read (see `toAmount` in the
 * services), but this is the last line of defence for every other collection
 * still handed straight to `formatCurrency`.
 */
export const formatCurrency = (value) => {
    const amount = Number(value);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
};
export const formatDateAndTime = (date) => isValid(date)
    ? new Intl.DateTimeFormat('pt-BR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
    : '';
export const formatMonthAndYear = (date) => isValid(date)
    ? new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: 'long' }).format(date)
    : '';
/** Accepts ISO strings, epoch numbers, Dates and Firestore Timestamps alike. */
export const toDate = (value) => {
    if (!value)
        return null;
    if (value instanceof Date)
        return isValid(value) ? value : null;
    if (typeof value === 'object' && 'seconds' in value) {
        return new Date(value.seconds * 1000);
    }
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
};
export const formatDate = (value) => {
    const date = toDate(value);
    return date
        ? new Intl.DateTimeFormat('pt-BR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
        }).format(date)
        : '';
};
/**
 * Visit dates are stored as plain calendar days. Rendering them in the
 * browser's local zone shifts them a day for anyone west of São Paulo, so they
 * are always formatted in the chácara's own timezone.
 */
export const formatVisitDate = (value) => {
    const date = toDate(value);
    return date
        ? new Intl.DateTimeFormat('pt-BR', {
            timeZone: SP_TIMEZONE,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date)
        : '';
};
export const formatVisitDateLong = (value) => {
    const date = toDate(value);
    return date
        ? new Intl.DateTimeFormat('pt-BR', {
            timeZone: SP_TIMEZONE,
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date)
        : '';
};
/** "(19) 99999-9999" as the visitor types. */
export const maskPhone = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2)
        return digits.replace(/^(\d{0,2})/, '($1');
    if (digits.length <= 6)
        return digits.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    if (digits.length <= 10)
        return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};
/** "13.024-000" */
export const maskZipcode = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? digits.replace(/^(\d{5})(\d{0,3})/, '$1-$2') : digits;
};
