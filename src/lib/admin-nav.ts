import type { User } from './types'

export type AdminSection = {
  label: string
  href: string
  /** Restricted to users carrying the `admin` role. */
  adminOnly: boolean
  /** Sections sharing a group are shown together under one dropdown in the menu. */
  group?: string
}

/**
 * The one description of the admin area: it drives both the top menu and the
 * route guard, so a section can never be hidden from the menu while still
 * being reachable by typing its URL.
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  { label: 'Pedidos', href: '/admin/pedidos', adminOnly: false },
  { label: 'Clientes', href: '/admin/clientes', adminOnly: false },
  { label: 'Produtos', href: '/admin/produtos', adminOnly: false, group: 'Catálogo' },
  {
    label: 'Gerenciamento',
    href: '/admin/gerenciamento',
    adminOnly: true,
    group: 'Catálogo',
  },
  { label: 'Visitas', href: '/admin/visitas', adminOnly: true, group: 'Gestão' },
  { label: 'Cupons', href: '/admin/cupons', adminOnly: true, group: 'Gestão' },
  {
    label: 'Cromatografias',
    href: '/admin/cromatografias',
    adminOnly: true,
    group: 'Catálogo',
  },
  { label: 'Relatórios', href: '/admin/relatorios', adminOnly: true, group: 'Gestão' },
  { label: 'Depoimentos', href: '/admin/depoimentos', adminOnly: true, group: 'Gestão' },
  { label: 'Usuários', href: '/admin/usuarios', adminOnly: true, group: 'Gestão' },
]

export type NavEntry =
  | { type: 'link'; section: AdminSection }
  | { type: 'group'; label: string; sections: AdminSection[] }

/**
 * What the header menu shows: a group becomes a dropdown, unless only one of
 * its sections is visible to this user — then it is just a link.
 */
export const navEntries = (user?: User): NavEntry[] => {
  const entries: NavEntry[] = []

  for (const section of visibleSections(user)) {
    if (!section.group) {
      entries.push({ type: 'link', section })
      continue
    }
    const existing = entries.find(
      (entry): entry is Extract<NavEntry, { type: 'group' }> =>
        entry.type === 'group' && entry.label === section.group,
    )
    if (existing) existing.sections.push(section)
    else entries.push({ type: 'group', label: section.group, sections: [section] })
  }

  return entries.map((entry) =>
    entry.type === 'group' && entry.sections.length === 1
      ? { type: 'link', section: entry.sections[0] }
      : entry,
  )
}

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
