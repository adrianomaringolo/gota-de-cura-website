'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { DataTable, type DataTableColumn } from 'buildgrid-ui'
import { AdminHeading, StatusTag } from '@/components/admin/AdminUI'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { groupByCustomer, type Customer } from '@/lib/customers'
import type { Order } from '@/lib/types'
import { OrdersService } from '@/services/orders'

const normalise = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** One flat row per customer: what the table sorts, searches and renders. */
type CustomerRow = {
  id: string
  name: string
  phone: string
  validOrders: number
  /** Epoch ms, so the column sorts by date instead of by the formatted text. */
  lastOrderAt: number
  /** Everything the search box should match: spellings, e-mail, phone with and without mask. */
  searchText: string
  customer: Customer
}

const toRow = (customer: Customer): CustomerRow => {
  const text = [
    customer.name,
    ...customer.aliases,
    customer.email ?? '',
    customer.phone,
    customer.phone.replace(/\D/g, ''),
  ].join(' ')

  return {
    id: customer.key,
    name: customer.name,
    phone: customer.phone,
    validOrders: customer.validOrders,
    lastOrderAt: customer.lastOrderAt?.getTime() ?? 0,
    // Both forms, so "joao" finds "João" and "João" does too.
    searchText: `${text} ${normalise(text)}`,
    customer,
  }
}

const HEAD =
  'border-b border-line bg-canvas-sunk px-4 py-3 text-xs font-semibold tracking-wide text-ink-soft uppercase'
const CELL = 'border-b border-line px-4 py-3 align-top text-sm text-ink'

const COLUMNS: DataTableColumn<CustomerRow>[] = [
  {
    key: 'name',
    headerClassName: HEAD,
    cellClassName: CELL,
    title: 'Cliente',
    sortable: true,
    customRenderer: (_, { customer }) => (
      <>
        <span className="font-medium">{customer.name}</span>
        {customer.aliases.length > 0 && (
          <span className="block text-xs text-ink-muted">
            Também: {customer.aliases.join(', ')}
          </span>
        )}
      </>
    ),
  },
  {
    key: 'phone',
    headerClassName: HEAD,
    cellClassName: CELL,
    title: 'Contato',
    customRenderer: (_, { customer }) => (
      <>
        <span className="block tabular-nums">{customer.phone || '—'}</span>
        {customer.email && (
          <span className="block text-xs text-ink-soft">{customer.email}</span>
        )}
      </>
    ),
  },
  {
    key: 'validOrders',
    headerClassName: HEAD,
    cellClassName: CELL,
    title: 'Pedidos',
    sortable: true,
    align: 'right',
    customRenderer: (_, { customer }) => (
      <span className="tabular-nums">
        <span className="font-semibold">{customer.validOrders}</span>
        {customer.canceledOrders > 0 && (
          <span className="block text-xs text-ink-muted">
            +{customer.canceledOrders}{' '}
            {customer.canceledOrders === 1 ? 'cancelado' : 'cancelados'}
          </span>
        )}
      </span>
    ),
  },
  {
    key: 'lastOrderAt',
    headerClassName: HEAD,
    cellClassName: CELL,
    title: 'Último pedido',
    sortable: true,
    customRenderer: (value: number) => (
      <span className="text-ink-soft tabular-nums">
        {value ? format(new Date(value), 'dd/MM/yyyy') : '—'}
      </span>
    ),
  },
  {
    key: 'customer',
    headerClassName: HEAD,
    cellClassName: CELL,
    title: 'Pedidos do cliente',
    customRenderer: (_, { customer }) => (
      <details>
        <summary className="cursor-pointer text-xs font-medium text-brand">
          Ver pedidos
        </summary>
        <ul className="mt-2 space-y-1.5">
          {customer.orders.map((order) => (
            <li key={order.id} className="flex items-center gap-2 text-xs">
              <Link
                href={`/admin/pedidos/${order.orderId}`}
                className="font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
              >
                #{order.orderId}
              </Link>
              <span className="text-ink-muted tabular-nums">
                {format(new Date(order.createdAt), 'dd/MM/yyyy')}
              </span>
              <StatusTag status={order.status} />
            </li>
          ))}
        </ul>
      </details>
    ),
  },
]

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    OrdersService.getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [])

  const rows = useMemo(
    () =>
      groupByCustomer(orders ?? [])
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
        .map(toRow),
    [orders],
  )

  return (
    <>
      <AdminHeading
        title="Clientes"
        description="Pedidos agrupados pelo celular ou pelo e-mail. O mesmo número ou o mesmo e-mail, com o nome escrito de outro jeito, conta como a mesma pessoa."
      />

      {orders === null ? (
        <LoadingRows rows={6} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum pedido ainda" />
      ) : (
        <DataTable
          data={rows}
          columns={COLUMNS}
          searchFields={['searchText']}
          pageSize={25}
          className="[&_*]:border-line [&_table]:border-collapse [&_tbody_tr]:hover:bg-canvas-sunk/50"
          tools={{
            search: { placeholder: 'Nome, celular ou e-mail' },
            filter: { hide: true },
            columnSelector: { hide: true },
            rowSelector: { hide: true },
            export: { hide: true },
          }}
          labels={{
            searchPlaceholder: 'Nome, celular ou e-mail',
            paginationCounter:
              'Mostrando {{startIndex}} a {{endIndex}} de {{totalItems}} clientes',
            noDataAvailable: 'Nenhum cliente encontrado.',
            noResultsWithFilters: 'Nenhum cliente encontrado.',
            searchBadgePrefix: 'Busca',
            sortBadgePrefix: 'Ordem',
            clearAllButton: 'Limpar',
          }}
        />
      )}
    </>
  )
}
