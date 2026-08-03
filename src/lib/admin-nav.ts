import type { User } from './types'

export type AdminSection = {
  label: string
  href: string
  /** Restricted to users carrying the `admin` role. */
  adminOnly: boolean
}

/**
 * The one description of the admin area: it drives both the top menu and the
 * route guard, so a section can never be hidden from the menu while still
 * being reachable by typing its URL.
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  { label: 'Pedidos', href: '/admin/pedidos', adminOnly: false },
  { label: 'Produtos', href: '/admin/produtos', adminOnly: false },
  { label: 'Gerenciamento', href: '/admin/gerenciamento', adminOnly: true },
  { label: 'Visitas', href: '/admin/visitas', adminOnly: true },
  { label: 'Cupons', href: '/admin/cupons', adminOnly: true },
  { label: 'Cromatografias', href: '/admin/cromatografias', adminOnly: true },
  { label: 'Relatórios', href: '/admin/relatorios', adminOnly: true },
]

export const isAdminUser = (user?: User): boolean =>
  Boolean(user?.roles?.includes('admin'))

export const visibleSections = (user?: User): AdminSection[] =>
  ADMIN_SECTIONS.filter((section) => !section.adminOnly || isAdminUser(user))

/** The section a path belongs to — `/admin/pedidos/12` resolves to Pedidos. */
export const sectionForPath = (pathname: string): AdminSection | undefined =>
  ADMIN_SECTIONS.find(
    (section) => pathname === section.href || pathname.startsWith(`${section.href}/`),
  )

/** Sections outside the list (the dashboard itself) are open to any signed-in user. */
export const canAccessPath = (pathname: string, user?: User): boolean => {
  const section = sectionForPath(pathname)
  return !section || !section.adminOnly || isAdminUser(user)
}
