'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AdminHeading, StatValue } from '@/components/admin/AdminUI'
import { Badge } from '@/components/ui/Feedback'
import { useLoggedUser } from '@/lib/hooks'
import { visibleSections } from '@/lib/admin-nav'
import { computeOrderKpis, formatDuration, formatPercent } from '@/lib/order-kpis'
import type { Order } from '@/lib/types'
import { OrdersService } from '@/services/orders'

/** How many of the latest orders the KPIs are computed over. */
const KPI_WINDOW = 50

function OrderKpiSection() {
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    OrdersService.getRecentOrders(KPI_WINDOW)
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [])

  const kpis = useMemo(() => (orders ? computeOrderKpis(orders) : null), [orders])

  if (!kpis || kpis.total === 0) return null

  return (
    <section aria-labelledby="kpis-title" className="mb-10">
      <h2 id="kpis-title" className="font-display text-xl font-semibold text-ink">
        Pedidos em números
      </h2>
      <p className="mt-1 mb-4 text-sm text-ink-soft">
        Considera os {kpis.total} pedidos mais recentes.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatValue
          label="Tempo médio de atendimento"
          value={formatDuration(kpis.avgFirstResponseMs)}
          hint={`Da entrada até sair de "Em espera" · ${kpis.firstResponseSample} pedidos`}
          tone="brand"
        />
        <StatValue
          label="Tempo médio de fechamento"
          value={formatDuration(kpis.avgCloseMs)}
          hint={`Da entrada até "Finalizado", sem cancelados · ${kpis.closeSample} pedidos`}
          tone="brand"
        />
        <StatValue
          label="Aguardando atendimento"
          value={kpis.waiting}
          hint='Pedidos ainda "Em espera"'
        />
        <StatValue
          label="Parados há mais de 2 dias"
          value={kpis.stale}
          hint="Abertos, sem mudança de status"
        />
        <StatValue label="Em aberto" value={kpis.open} />
        <StatValue label="Finalizados" value={kpis.finalized} />
        <StatValue
          label="Taxa de cancelamento"
          value={formatPercent(kpis.cancelRate)}
          hint={`${kpis.canceled} de ${kpis.total} pedidos`}
        />
        <StatValue
          label="Com entrega (vs. retirada)"
          value={formatPercent(kpis.shippingShare)}
          hint="Entre os não cancelados"
        />
        <StatValue
          label="Mais pedidos"
          value={
            <span className="block text-base leading-snug">
              {kpis.topProducts.length
                ? kpis.topProducts.map((p) => `${p.name} (${p.amount})`).join(', ')
                : '—'}
            </span>
          }
          hint="Unidades, sem cancelados"
        />
      </div>
    </section>
  )
}

const ACCESS = {
  admin: { label: 'Admin', tone: 'brand' },
  team: { label: 'Equipe', tone: 'neutral' },
} as const

/** Descriptions only — which sections exist, and who may see them, lives in
 *  admin-nav.ts so the dashboard can never drift from the menu. */
const DESCRIPTIONS: Record<string, { title: string; text: string }> = {
  '/admin/pedidos': {
    title: 'Pedidos',
    text: 'Ver, acompanhar e mudar o status dos pedidos do site.',
  },
  '/admin/clientes': {
    title: 'Clientes',
    text: 'Pedidos agrupados por cliente, pelo número de celular.',
  },
  '/admin/produtos': {
    title: 'Disponibilidade',
    text: 'Marcar produtos como disponíveis ou esgotados e anotar quantidades.',
  },
  '/admin/gerenciamento': {
    title: 'Gerenciar produtos',
    text: 'Criar, editar e excluir produtos do catálogo.',
  },
  '/admin/visitas': {
    title: 'Visitas',
    text: 'Conferir inscritos por data e enviar o e-mail de agradecimento.',
  },
  '/admin/cupons': {
    title: 'Cupons',
    text: 'Criar cupons de desconto e vale-presente.',
  },
  '/admin/cromatografias': {
    title: 'Cromatografias',
    text: 'Publicar e editar os laudos exibidos no site.',
  },
  '/admin/relatorios': {
    title: 'Relatórios',
    text: 'Receita e volume de pedidos por período.',
  },
  '/admin/usuarios': {
    title: 'Usuários',
    text: 'Quem acessa o painel, quem é administrador e redefinição de senha.',
  },
}

export default function AdminHomePage() {
  const { user, isAdmin } = useLoggedUser()
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <>
      <AdminHeading title={`Olá, ${firstName}`} description="Escolha por onde começar." />

      <OrderKpiSection />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSections(user)
          .map((section) => ({ ...section, ...DESCRIPTIONS[section.href] }))
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
