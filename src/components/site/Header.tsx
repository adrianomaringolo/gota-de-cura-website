'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { useCart } from '@/lib/cart-context'
import { Wordmark } from './Wordmark'

const NAV = [
  { key: 'catalog', href: '/#catalogo' },
  { key: 'visits', href: '/visitas' },
  { key: 'chromatographies', href: '/cromatografias' },
  { key: 'blog', href: '/blog' },
  { key: 'about', href: '/sobre' },
  { key: 'contact', href: '/#contato' },
] as const

export function Header() {
  const t = useTranslations('header')
  const pathname = usePathname()
  const { count, ready } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // The drawer owns the viewport while it is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isActive = (href: string) =>
    href.startsWith('/#') ? false : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[var(--z-tooltip)] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        {t('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[var(--z-sticky)] transition-all duration-300 ease-[var(--ease-out-quart)]',
          // Solid at rest: a translucent bar over the dark hero bands reads as
          // a muddy grey strip rather than a masthead.
          scrolled
            ? 'border-b border-line bg-canvas/94 shadow-lift backdrop-blur-md'
            : 'border-b border-transparent bg-canvas',
        )}
      >
        <div className="mx-auto flex h-18 max-w-[86rem] items-center gap-6 px-4 sm:px-6 lg:px-10">
          <Wordmark />

          <nav aria-label={t('mainNav')} className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                      isActive(item.href)
                        ? 'text-brand'
                        : 'text-ink-soft hover:text-brand',
                    )}
                  >
                    {t(`nav.${item.key}`)}
                    <span
                      className={cn(
                        'absolute inset-x-4 -bottom-px h-0.5 origin-center scale-x-0 rounded-full bg-brand',
                        'transition-transform duration-300 ease-[var(--ease-out-quart)]',
                        isActive(item.href) && 'scale-x-100',
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <LanguageSwitch className="hidden lg:inline-flex" />
            <CartButton count={ready ? count : 0} />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('openMenu')}
              aria-expanded={menuOpen}
              className="grid h-11 w-11 place-items-center rounded-full text-brand transition-colors hover:bg-brand-tint lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

function CartButton({ count }: { count: number }) {
  const t = useTranslations('header')

  return (
    <Link
      href="/carrinho"
      className="relative grid h-11 w-11 place-items-center rounded-full text-brand transition-colors hover:bg-brand-tint"
      aria-label={count > 0 ? t('cartWithCount', { count }) : t('cart')}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6.5 8h11l-1 11.2a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6.5 8Z" />
        <path d="M9.5 10V6.5a2.5 2.5 0 0 1 5 0V10" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-terra px-1 text-2xs font-bold text-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  )
}

/**
 * Swaps the language and keeps the visitor on the same page. Each option is
 * labelled in its own language, so it reads right whichever one is active.
 */
function LanguageSwitch({
  tone = 'ink',
  className,
}: {
  tone?: 'ink' | 'light'
  className?: string
}) {
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('language')}
      className={cn(
        'items-center gap-0.5 rounded-full p-0.5 text-xs font-bold tracking-[0.08em]',
        tone === 'ink' ? 'border border-line' : 'border border-white/25',
        className,
      )}
    >
      {LANGUAGES.map((language) => {
        const current = language.locale === locale
        return (
          <Link
            key={language.locale}
            href={pathname}
            locale={language.locale}
            lang={language.locale}
            hrefLang={language.locale}
            aria-current={current ? 'true' : undefined}
            aria-label={language.name}
            className={cn(
              'rounded-full px-2.5 py-1.5 transition-colors',
              current
                ? tone === 'ink'
                  ? 'bg-brand text-white'
                  : 'bg-white text-brand-darkest'
                : tone === 'ink'
                  ? 'text-ink-soft hover:text-brand'
                  : 'text-white/70 hover:text-white',
            )}
          >
            {language.short}
          </Link>
        )
      })}
    </nav>
  )
}

const LANGUAGES = [
  { locale: 'pt-BR', short: 'PT', name: 'Português' },
  { locale: 'en', short: 'EN', name: 'English' },
] as const

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('header')

  return (
    <div
      className={cn(
        'fixed inset-0 z-[var(--z-modal)] lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-veil/55 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        role="dialog"
        aria-modal={open}
        aria-label={t('menu')}
        className={cn(
          'absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-brand-darkest',
          'transition-transform duration-400 ease-[var(--ease-out-expo)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Wordmark tone="light" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('closeMenu')}
            className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            tabIndex={open ? 0 : -1}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label={t('mainNavMobile')} className="flex-1 overflow-y-auto px-6 py-4">
          <ul className="flex flex-col">
            {NAV.map((item, index) => (
              <li key={item.href} className="border-b border-white/12">
                <Link
                  href={item.href}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  className="block py-4 font-display text-2xl text-white transition-[padding-left,color] duration-200 hover:pl-2 hover:text-brand-soft"
                  style={{
                    transitionDelay: open ? `${index * 25}ms` : '0ms',
                  }}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/carrinho"
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="block py-4 font-display text-2xl text-white transition-[padding-left,color] duration-200 hover:pl-2 hover:text-brand-soft"
              >
                {t('cart')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="px-6 pb-4">
          <LanguageSwitch tone="light" className="inline-flex" />
        </div>

        <p className="px-6 pb-8 text-sm text-white/60">
          Chácara da Mãe Luzia
          <br />
          Santo Antônio de Posse · SP
        </p>
      </div>
    </div>
  )
}
