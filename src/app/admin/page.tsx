'use client'

import Link from 'next/link'
import { AdminHeading } from '@/components/admin/AdminUI'
import { useLoggedUser } from '@/lib/hooks'

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
          .map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="group rounded-xl border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-brand/40 hover:shadow-lift"
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
            </Link>
          ))}
      </div>
    </>
  )
}
