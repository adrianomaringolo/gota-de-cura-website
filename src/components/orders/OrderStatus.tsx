'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { StatusTag } from '@/components/admin/AdminUI'
import { Container } from '@/components/site/Section'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { orderStatusLabel } from '@/lib/constants'
import { formatCurrency, formatDateAndTime } from '@/lib/format'
import { typeDisplayName } from '@/lib/product-types'
import { SITE } from '@/lib/site'
import type { Order } from '@/lib/types'
import { couponDiscount, OrdersService, orderTotal } from '@/services/orders'

export function OrderStatus({ orderRef }: { orderRef: string }) {
  const t = useTranslations('orderStatus')
  const locale = useLocale()
  const money = (value: number) => formatCurrency(value, locale)
  const status = (value: string) => (
    <StatusTag status={value} label={orderStatusLabel(value, locale)} />
  )
  const link =
    'font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand'
  const [order, setOrder] = useState<Order | null | undefined>(undefined)

  const load = useCallback(async () => {
    try {
      setOrder(await OrdersService.getPublicOrder(orderRef))
    } catch {
      setOrder(null)
    }
  }, [orderRef])

  useEffect(() => {
    void load()
  }, [load])

  if (order === undefined) {
    return (
      <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
        <LoadingRows rows={5} />
      </Container>
    )
  }

  if (order === null) {
    return (
      <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
        <EmptyState
          title={t('notFoundTitle')}
          action={<ButtonLink href="/">{t('home')}</ButtonLink>}
        >
          {t.rich('notFoundBody', {
            instagram: (chunks) => (
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className={link}>
                {chunks}
              </a>
            ),
          })}
        </EmptyState>
      </Container>
    )
  }

  const items = order.items.filter((item) => item.amount)
  const subtotal = orderTotal(order.items)
  const discount = couponDiscount(subtotal, order.coupon)

  return (
    <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {t('title', { number: order.orderId })}
        </h1>
        {status(order.status)}
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        {t('placedOn', { date: formatDateAndTime(new Date(order.createdAt), locale) })}
      </p>

      <div className="mt-8 rounded-2xl border border-brand/20 bg-brand-tint px-6 py-5">
        <p className="text-base leading-relaxed text-ink">
          {t.rich('greeting', {
            name: order.contactInfo.name,
            email: SITE.email,
            strong: (chunks) => <strong>{chunks}</strong>,
            instagram: (chunks) => (
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className={link}>
                {chunks}
              </a>
            ),
            mail: (chunks) => (
              <a href={`mailto:${SITE.email}`} className={link}>
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-ink">
        {t('products')}
      </h2>
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item, index) => (
          <li key={`${item.id}-${index}`} className="flex items-baseline gap-4 py-3">
            <span className="w-10 shrink-0 text-right font-semibold text-ink tabular-nums">
              {item.amount}×
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink">
                {locale === 'pt-BR' ? item.name : (item.localizedName ?? item.name)}
              </span>
              <span className="block text-sm text-ink-muted">
                {typeDisplayName(item.type, locale)}
              </span>
            </span>
            <span className="shrink-0 font-medium text-ink tabular-nums">
              {money(item.price * item.amount)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 ml-auto max-w-sm space-y-1.5 text-base">
        <div className="flex justify-between">
          <dt className="text-ink-soft">{t('subtotal')}</dt>
          <dd className="tabular-nums">{money(subtotal)}</dd>
        </div>
        {order.coupon && discount > 0 && (
          <div className="flex justify-between text-positive">
            <dt>{t('coupon', { code: order.coupon.number })}</dt>
            <dd className="tabular-nums">− {money(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-2">
          <dt className="font-display text-lg font-semibold text-ink">{t('total')}</dt>
          <dd className="font-display text-xl font-semibold text-ink tabular-nums">
            {money(subtotal - discount)}
          </dd>
        </div>
      </dl>

      {order.statusLogs && order.statusLogs.length > 0 && (
        <>
          <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-ink">
            {t('history')}
          </h2>
          <ul className="space-y-2.5">
            {order.statusLogs.map((log, index) => (
              <li key={index} className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="text-xs text-ink-muted tabular-nums">
                  {formatDateAndTime(new Date(log.updatedAt), locale)}
                </span>
                {status(log.newStatus)}
              </li>
            ))}
          </ul>
        </>
      )}
    </Container>
  )
}
