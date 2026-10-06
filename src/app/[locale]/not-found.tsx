import { useTranslations } from 'next-intl'
import { Wordmark } from '@/components/site/Wordmark'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <main className="grid min-h-screen place-items-center bg-brand-darkest px-6 py-20 text-white">
      <div className="max-w-lg text-center">
        <Wordmark tone="light" size="md" className="justify-center" />
        <h1 className="mt-10 font-display text-3xl font-semibold">{t('title')}</h1>
        <p className="mt-4 text-lg leading-relaxed text-white/70">{t('body')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-brand-darkest transition-colors hover:bg-brand-soft"
          >
            {t('home')}
          </Link>
          <Link
            href="/#catalogo"
            className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            {t('catalog')}
          </Link>
        </div>
      </div>
    </main>
  )
}
