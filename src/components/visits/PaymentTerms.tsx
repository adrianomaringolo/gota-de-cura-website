import { useLocale, useTranslations } from 'next-intl'
import { VISIT_PRICES_NUMERIC } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'

/** Each block is a `paymentTerms.<key>` message with a `title` and its items. */
const blocks = [
  { key: 'before', items: ['schedule', 'travel', 'prices'] },
  { key: 'payment', items: ['arranged', 'confirmed'] },
  { key: 'cancellation', items: ['fourteenDays', 'sevenDays', 'lastWeek'] },
] as const

export function PaymentTerms() {
  const t = useTranslations('paymentTerms')
  const prices = useTranslations('visitPrices')
  const locale = useLocale()
  const price = (value: number) =>
    value ? formatCurrency(value, locale) : prices('free')

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <section key={block.key}>
          <h3 className="font-display text-lg font-semibold text-ink">
            {t(`${block.key}.title`)}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {block.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-base text-ink-soft">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-terra"
                />
                {t(`${block.key}.${item}`, {
                  adult: price(VISIT_PRICES_NUMERIC.ADULT),
                  child: price(VISIT_PRICES_NUMERIC.CHILD),
                  free: price(VISIT_PRICES_NUMERIC.FREE),
                })}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
