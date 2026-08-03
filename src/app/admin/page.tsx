'use client'

import Link from 'next/link'
import { AdminHeading } from '@/components/admin/AdminUI'
import { Badge } from '@/components/ui/Feedback'
import { useLoggedUser } from '@/lib/hooks'

/** `adminOnly` stays the single source of truth — this only labels it. */
const ACCESS = {
  admin: { label: 'Admin', tone: 'brand' },
  team: { label: 'Equipe', tone: 'neutral' },
} as const

const shortcuts = [
  {
    href: '/admin/pedidos',
    title: 'Pedidos',
    text: 'Ver, acompanhar e mudar o status dos pedidos do site.',
    adminOnly: false,
  },
  {
    href: '/admin/produtos',
    title: 'Disponibilidade',
    text: 'Marcar produtos como disponíveis ou esgotados e anotar quantidades.',
    adminOnly: false,
  },
  {
    href: '/admin/gerenciamento',
    title: 'Gerenciar produtos',
    text: 'Criar, editar e excluir produtos do catálogo.',
    adminOnly: true,
  },
  {
    href: '/admin/visitas',
    title: 'Visitas',
    text: 'Conferir inscritos por data e enviar o e-mail de agradecimento.',
    adminOnly: true,
  },
  {
    href: '/admin/cupons',
    title: 'Cupons',
    text: 'Criar cupons de desconto e vale-presente.',
    adminOnly: true,
  },
  {
    href: '/admin/cromatografias',
    title: 'Cromatografias',
    text: 'Publicar e editar os laudos exibidos no site.',
    adminOnly: true,
  },
  {
    href: '/admin/relatorios',
    title: 'Relatórios',
    text: 'Receita e volume de pedidos por período.',
    adminOnly: true,
  },
]

export default function AdminHomePage() {
  const { user, isAdmin } = useLoggedUser()
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <>
      <AdminHeading title={`Olá, ${firstName}`} description="Escolha por onde começar." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts
          .filter((shortcut) => !shortcut.adminOnly || isAdmin)
          .map((shortcut) => {
            const access = shortcut.adminOnly ? ACCESS.admin : ACCESS.team

            return (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-brand/40 hover:shadow-lift"
              >
                <h2 className="flex items-center justify-between font-display text-lg font-semibold text-ink">
                  {shortcut.title}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </h2>
                <p className="mt-1.5 text-sm text-ink-soft">{shortcut.text}</p>
                {/* Only an admin sees a mix of both labels; for the team every
                    card they can reach says the same thing, so it is noise. */}
                {isAdmin && (
                  <div className="mt-auto pt-4">
                    <Badge tone={access.tone}>
                      <span className="sr-only">Acesso: </span>
                      {access.label}
                    </Badge>
                  </div>
                )}
              </Link>
            )
          })}
      </div>
    </>
  )
}
