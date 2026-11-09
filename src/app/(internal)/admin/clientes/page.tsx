'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AdminHeading, StatusTag, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { Input } from '@/components/ui/Field'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { groupByCustomer } from '@/lib/customers'
import type { Order } from '@/lib/types'
import { OrdersService } from '@/services/orders'

const normalise = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    OrdersService.getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [])

  const customers = useMemo(
    () =>
      groupByCustomer(orders ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      ),
    [orders],
  )

  const filtered = useMemo(() => {
    const term = normalise(search.trim())
    if (!term) return customers
    const digits = term.replace(/\D/g, '')

    return customers.filter(
      (customer) =>
        normalise(
          [customer.name, ...customer.aliases, customer.email ?? ''].join(' '),
        ).includes(term) ||
        (digits.length >= 3 && customer.phone.replace(/\D/g, '').includes(digits)),
    )
  }, [customers, search])

  return (
    <>
      <AdminHeading
        title="Clientes"
        description="Pedidos agrupados pelo celular. O mesmo número com o nome escrito de outro jeito conta como a mesma pessoa."
      />

      {orders === null ? (
        <LoadingRows rows={6} />
      ) : customers.length === 0 ? (
        <EmptyState title="Nenhum pedido ainda" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <Input
              label="Buscar"
              type="search"
              placeholder="Nome, celular ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72"
            />
            <p className="text-sm text-ink-soft">
              {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="Nenhum cliente encontrado" />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Cliente</Th>
                  <Th>Contato</Th>
                  <Th className="text-right">Pedidos</Th>
                  <Th>Último pedido</Th>
                  <Th>Pedidos do cliente</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.key} className="hover:bg-canvas-sunk/60">
                    <Td>
                      <span className="font-medium">{customer.name}</span>
                      {customer.aliases.length > 0 && (
                        <span className="block text-xs text-ink-muted">
                          Também: {customer.aliases.join(', ')}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <span className="block tabular-nums">{customer.phone || '—'}</span>
                      {customer.email && (
                        <span className="block text-xs text-ink-soft">
                          {customer.email}
                        </span>
                      )}
                    </Td>
                    <Td className="text-right tabular-nums">
                      <span className="font-semibold">{customer.validOrders}</span>
                      {customer.canceledOrders > 0 && (
                        <span className="block text-xs text-ink-muted">
                          +{customer.canceledOrders}{' '}
                          {customer.canceledOrders === 1 ? 'cancelado' : 'cancelados'}
                        </span>
                      )}
                    </Td>
                    <Td className="text-ink-soft tabular-nums">
                      {customer.lastOrderAt
                        ? format(customer.lastOrderAt, 'dd/MM/yyyy')
                        : '—'}
                    </Td>
                    <Td>
                      <details>
                        <summary className="cursor-pointer text-xs font-medium text-brand">
                          Ver pedidos
                        </summary>
                        <ul className="mt-2 space-y-1.5">
                          {customer.orders.map((order) => (
                            <li
                              key={order.id}
                              className="flex items-center gap-2 text-xs"
                            >
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
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </>
      )}
    </>
  )
}
