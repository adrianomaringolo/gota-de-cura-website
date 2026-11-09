'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/cn'
import { useDisclosure, useLoggedUser } from '@/lib/hooks'
import {
  canAccessPath,
  navEntries,
  visibleSections,
  type AdminSection,
} from '@/lib/admin-nav'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from 'buildgrid-ui'
import { UsersService } from '@/services/users'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Spinner } from '@/components/ui/Feedback'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, resolved } = useLoggedUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const signOutConfirm = useDisclosure()

  const signOut = () => {
    signOutConfirm.close()
    UsersService.signOut()
    router.replace('/admin/login')
  }

  const isLoginPage = pathname === '/admin/login'
  const allowed = canAccessPath(pathname, user)

  useEffect(() => {
    if (!resolved || isLoginPage) return
    if (!user) router.replace('/admin/login')
    // The menu hiding a section is presentation; this is what actually keeps a
    // typed URL out.
    else if (!allowed) router.replace('/admin')
  }, [resolved, user, allowed, isLoginPage, router])

  // Which login's session has been confirmed against Firestore. A reset
  // password or a removed account ends the session here, on the next visit,
  // instead of waiting for a manual sign-out.
  const [verifiedLogin, setVerifiedLogin] = useState<string | null>(null)
  const login = user?.login

  useEffect(() => {
    if (!login || isLoginPage) return
    const stored = UsersService.getStoredUser()
    if (!stored) return

    let cancelled = false
    const verify = async () => {
      const status = await UsersService.checkSession(stored)
      if (cancelled) return
      if (status === 'valid') {
        setVerifiedLogin(stored.login)
        return
      }
      UsersService.signOut()
      toast(
        status === 'removed'
          ? 'Seu acesso ao painel foi removido.'
          : status === 'archived'
            ? 'Seu acesso ao painel foi arquivado.'
            : 'Sua senha foi redefinida. Entre com a senha padrão e crie uma nova.',
        { duration: 8000 },
      )
      router.replace('/admin/login')
    }

    verify()
    // Coming back to a tab left open counts as a new visit too.
    const onVisible = () => {
      if (document.visibilityState === 'visible') verify()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [login, isLoginPage, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (isLoginPage) return <>{children}</>

  if (!resolved || !user || !allowed || verifiedLogin !== user.login) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <Spinner className="text-brand" />
      </div>
    )
  }

  const links = visibleSections(user)
  const entries = navEntries(user)

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

          <div className="hidden flex-1 lg:block">
            <AdminNav pathname={pathname} entries={entries} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:block">{user.name}</span>
            <button
              type="button"
              onClick={signOutConfirm.open}
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

      <Dialog
        open={signOutConfirm.isOpen}
        onClose={signOutConfirm.close}
        title="Sair do painel?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={signOutConfirm.close}>
              Cancelar
            </Button>
            <Button onClick={signOut}>Sair</Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Sua sessão será encerrada neste navegador. Para voltar ao painel você precisará
          informar login e senha outra vez.
        </p>
      </Dialog>
    </div>
  )
}

const TRIGGER_CLASS =
  'h-auto rounded-full bg-transparent px-3.5 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white data-[state=open]:bg-white/15 data-[state=open]:text-white data-[state=open]:hover:bg-white/15 data-[state=open]:focus:bg-white/15'

const isActive = (pathname: string, section: AdminSection) =>
  pathname.startsWith(section.href)

function AdminNav({
  pathname,
  entries,
}: {
  pathname: string
  entries: ReturnType<typeof navEntries>
}) {
  return (
    <NavigationMenu
      viewport={false}
      aria-label="Painel"
      className="max-w-none justify-start"
    >
      <NavigationMenuList className="justify-start gap-0.5">
        {entries.map((entry) =>
          entry.type === 'link' ? (
            <NavigationMenuItem key={entry.section.href}>
              <NavigationMenuLink
                asChild
                active={isActive(pathname, entry.section)}
                className={cn('inline-flex items-center justify-center', TRIGGER_CLASS)}
              >
                <Link href={entry.section.href}>{entry.section.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={entry.label}>
              <NavigationMenuTrigger
                className={cn(
                  TRIGGER_CLASS,
                  entry.sections.some((section) => isActive(pathname, section)) &&
                    'bg-white/15 text-white',
                )}
              >
                {entry.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="top-full left-0 mt-2 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1.5 text-ink shadow-lift">
                <ul className="grid gap-0.5">
                  {entry.sections.map((section) => (
                    <li key={section.href}>
                      <NavigationMenuLink
                        asChild
                        active={isActive(pathname, section)}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-brand/10 hover:text-brand focus:bg-brand/10 focus:text-brand data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
                      >
                        <Link href={section.href}>{section.label}</Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
