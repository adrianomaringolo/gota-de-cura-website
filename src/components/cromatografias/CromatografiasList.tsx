'use client'

import { useTranslations } from 'next-intl'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { useCromatografias } from '@/lib/hooks'
import type { Cromatografia, CromatografiaType } from '@/lib/types'
import { CromatografiasService } from '@/services/cromatografias'

/** Each group's heading and note live under `chromatography.types` / `.notes`. */
const GROUPS: CromatografiaType[] = ['oleo-essencial', 'hidrolato']

export function CromatografiasList() {
  const t = useTranslations('chromatography')
  const { data, loading } = useCromatografias()

  if (loading) return <LoadingRows rows={6} />

  if (data.length === 0) {
    return <EmptyState title={t('emptyTitle')}>{t('emptyBody')}</EmptyState>
  }

  return (
    <div className="space-y-16">
      {GROUPS.map((type) => {
        const items = data.filter((item) => item.type === type)
        if (items.length === 0) return null

        return (
          <section key={type}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line-strong pb-4">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {t(`types.${type}`)}
                <span className="ml-3 font-sans text-sm font-normal text-ink-muted tabular-nums">
                  {t('count', { count: items.length })}
                </span>
              </h2>
              <p className="text-sm text-ink-soft">{t(`notes.${type}`)}</p>
            </div>

            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.id}>
                  <LaudoRow item={item} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function LaudoRow({ item }: { item: Cromatografia }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        void CromatografiasService.incrementViewCount(item.id).catch(() => undefined)
      }}
      className="group flex items-center gap-4 border-b border-line py-4 transition-colors hover:border-brand"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg leading-tight font-semibold text-ink transition-colors group-hover:text-brand">
          {item.name}
        </span>
        <span className="block text-sm text-ink-muted italic">{item.scientificName}</span>
      </span>

      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-brand">
        <span className="hidden sm:inline">PDF</span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </span>
    </a>
  )
}
