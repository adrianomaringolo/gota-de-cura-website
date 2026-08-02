'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useLoggedUser } from '@/lib/hooks'
import { UsersService } from '@/services/users'
import { Spinner } from '@/components/ui/Feedback'

const NAV = [
  { label: 'Pedidos', href: '/admin/pedidos', adminOnly: false },
  { label: 'Produtos', href: '/admin/produtos', adminOnly: false },
  { label: 'Gerenciamento', href: '/admin/gerenciamento', adminOnly: true },
  { label: 'Visitas', href: '/admin/visitas', adminOnly: true },
  { label: 'Cupons', href: '/admin/cupons', adminOnly: true },
  { label: 'Cromatografias', href: '/admin/cromatografias', adminOnly: true },
  { label: 'Relatórios', href: '/admin/relatorios', adminOnly: true },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, resolved, isAdmin } = useLoggedUser()
  const [menuOpen, setMenuOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (resolved && !user && !isLoginPage) router.replace('/admin/login')
  }, [resolved, user, isLoginPage, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (isLoginPage) return <>{children}</>

  if (!resolved || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <Spinner className="text-brand" />
      </div>
    )
  }

  const links = NAV.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-line bg-brand-darkest text-white print-none">
        <div className="mx-auto flex max-w-[92rem] items-center gap-4 px-4 py-3 lg:px-8">
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-2 font-[family-name:var(--font-wordmark)] text-base lowercase"
          >
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-xs font-bold"
            >
              gc
            </span>
            painel
          </Link>

          <nav aria-label="Painel" className="hidden flex-1 lg:block">
            <ul className="flex flex-wrap items-center gap-0.5">
              {links.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-white/15 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:block">{user.name}</span>
            <button
              type="button"
              onClick={() => {
                UsersService.signOut()
                router.replace('/admin/login')
              }}
              className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              Sair
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label="Abrir menu do painel"
              className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
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

        {menuOpen && (
          <nav aria-label="Painel (móvel)" className="border-t border-white/10 lg:hidden">
            <ul className="mx-auto max-w-[92rem] px-4 py-2">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-[92rem] px-4 py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  )
}
