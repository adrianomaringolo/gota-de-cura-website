'use client'

import { deliverySummary } from '@/lib/orders-delivery'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Copy, ExternalLink, Link2, MessageCircle, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field'
import { Badge, EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_OPTIONS,
  orderStatusLabel,
} from '@/lib/constants'
import { formatCurrency, formatDateAndTime } from '@/lib/format'
import { useLoggedUser } from '@/lib/hooks'
import { formatDuration } from '@/lib/order-kpis'
import type { Order } from '@/lib/types'
import {
  couponDiscount,
  OrdersService,
  orderTotal,
  publicOrderUrl,
} from '@/services/orders'
import { toAmount } from '@/lib/format'
import { DeliveryDialog } from './DeliveryDialog'
import { DeliveryPill } from './DeliveryPill'
import { OrderItemsDialog } from './OrderItemsDialog'
import { AssigneePicker } from './AssigneePicker'
import { OrderStockPanel } from './OrderStock'
import { ActionMenu } from './ActionMenu'
import { Panel, StatusTag, Td, Th, TableWrap } from './AdminUI'

/**
 * WhatsApp chat link; assumes Brazil (+55) when the number has no country code.
 * On phones wa.me opens the app directly; on desktop we go straight to WhatsApp Web.
 */
function whatsappUrlFor(phone: string, mobile: boolean): string | null {
  let digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  if (digits.length <= 11) digits = `55${digits}`
  return mobile
    ? `https://wa.me/${digits}`
    : `https://web.whatsapp.com/send?phone=${digits}`
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [tab, setTab] = useState<'comments' | 'history'>('comments')
  const [editItemsOpen, setEditItemsOpen] = useState(false)
  const [editPhoneOpen, setEditPhoneOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const router = useRouter()
  const [editDeliveryOpen, setEditDeliveryOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent))
  }, [])

  const load = useCallback(async () => {
    try {
      setOrder(await OrdersService.getOrderById(orderId))
    } catch {
      setOrder(null)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  if (order === undefined) return <LoadingRows rows={5} />
  if (order === null) {
    return (
      <EmptyState title={`Pedido #${orderId} não encontrado`}>
        Ele pode ter sido removido. Volte para a lista de pedidos.
      </EmptyState>
    )
  }

  const subtotal = orderTotal(order.items)
  const discount = couponDiscount(subtotal, order.coupon)
  // The page the customer sees, in the language they ordered in.
  const whatsappUrl = whatsappUrlFor(order.contactInfo.phone, isMobile)
  const publicUrl = publicOrderUrl(order.id, order.locale ?? 'pt-BR')
  const duplicate = async () => {
    setDuplicating(true)
    try {
      const { orderNumber, orderRef } = await OrdersService.duplicateOrder(order)
      toast.success(`Pedido #${orderNumber} criado`)
      setDuplicateOpen(false)
      router.push(`/admin/pedidos/${orderRef}`)
    } catch {
      toast.error('Não foi possível duplicar o pedido')
    } finally {
      setDuplicating(false)
    }
  }
  const copyPublicLink = () =>
    navigator.clipboard.writeText(publicUrl).then(
      () => toast.success('Link copiado'),
      () => toast.error('Não foi possível copiar o link'),
    )

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print-none">
        <Link
          href="/admin/pedidos"
          className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          ← Voltar aos pedidos
        </Link>
        <ActionMenu
          variant="button"
          items={[
            ...(whatsappUrl
              ? [
                  {
                    label: 'Abrir WhatsApp',
                    icon: <MessageCircle className="h-4 w-4" aria-hidden="true" />,
                    onSelect: () =>
                      window.open(whatsappUrl, '_blank', 'noopener,noreferrer'),
                  },
                ]
              : []),
            {
              label: 'Copiar link do cliente',
              icon: <Link2 className="h-4 w-4" aria-hidden="true" />,
              onSelect: copyPublicLink,
            },
            {
              label: 'Ver página pública',
              icon: <ExternalLink className="h-4 w-4" aria-hidden="true" />,
              onSelect: () => window.open(publicUrl, '_blank', 'noopener,noreferrer'),
            },
            {
              label: 'Imprimir',
              icon: <Printer className="h-4 w-4" aria-hidden="true" />,
              onSelect: () => window.print(),
            },
            {
              label: 'Duplicar pedido',
              icon: <Copy className="h-4 w-4" aria-hidden="true" />,
              onSelect: () => setDuplicateOpen(true),
            },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Pedido #{order.orderId}
            </h1>
            <StatusTag status={order.status} size="lg" />
            <DeliveryPill delivery={order.delivery} />
            {order.locale === 'en' && <Badge tone="lab">Cliente em inglês</Badge>}
            {order.contactInfo.preferredContact && (
              <Badge tone="lab">
                Contato:{' '}
                {order.contactInfo.preferredContact === 'email' ? 'e-mail' : 'WhatsApp'}
              </Badge>
            )}
          </div>

          <p className="mt-3 font-display text-xl text-ink">{order.contactInfo.name}</p>
          <dl className="mt-4 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {[
              ['Feito em', formatDateAndTime(new Date(order.createdAt))],
              [
                'Celular',
                <span key="phone" className="flex flex-wrap items-center gap-x-3">
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
                    >
                      {order.contactInfo.phone} ↗
                    </a>
                  ) : (
                    order.contactInfo.phone
                  )}
                  <button
                    type="button"
                    onClick={() => setEditPhoneOpen(true)}
                    className="print-none text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    Editar
                  </button>
                </span>,
              ],
              ['E-mail', order.contactInfo.email || '—'],
              [
                'Prefere contato por',
                order.contactInfo.preferredContact === 'email'
                  ? 'E-mail'
                  : order.contactInfo.preferredContact === 'whatsapp'
                    ? 'WhatsApp'
                    : 'Não informado',
              ],
              [
                'Entrega',
                <span key="delivery" className="flex flex-wrap items-center gap-x-3">
                  {deliverySummary(order)}
                  <button
                    type="button"
                    onClick={() => setEditDeliveryOpen(true)}
                    className="print-none text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    Editar
                  </button>
                </span>,
              ],
            ].map(([label, value]) => (
              <div key={label as string} className="flex gap-2">
                <dt className="shrink-0 text-ink-muted">{label}:</dt>
                <dd className="min-w-0 break-words text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {order.shippingNotes && (
            <p className="mt-4 rounded-lg bg-canvas-sunk px-4 py-3 text-sm whitespace-pre-line text-ink">
              <strong className="font-semibold">Detalhes do frete:</strong>{' '}
              {order.shippingNotes}
            </p>
          )}
          {order.contactInfo.observations && (
            <p className="mt-4 rounded-lg bg-warning-tint px-4 py-3 text-sm text-ink">
              <strong className="font-semibold">Observações:</strong>{' '}
              {order.contactInfo.observations}
            </p>
          )}
          <div className="mt-8 mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">Produtos</h2>
            <Button
              variant="outline"
              size="sm"
              className="print-none"
              onClick={() => setEditItemsOpen(true)}
            >
              Editar itens
            </Button>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface md:hidden">
            {order.items
              .filter((item) => item.amount)
              .map((item, index) => (
                <li key={`${item.id}-${index}`} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink-muted">{item.type}</p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-ink">
                      {formatCurrency(item.price * (item.amount || 0))}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft tabular-nums">
                    {item.amount} × {formatCurrency(item.price)}
                  </p>
                </li>
              ))}
          </ul>
          <div className="hidden md:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Produto</Th>
                  <Th className="text-right">Preço un.</Th>
                  <Th className="text-right">Qtd.</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {order.items
                  .filter((item) => item.amount)
                  .map((item, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <Td>
                        <span className="font-medium">{item.name}</span>
                        <span className="block text-xs text-ink-muted">{item.type}</span>
                      </Td>
                      <Td className="text-right tabular-nums">
                        {formatCurrency(item.price)}
                      </Td>
                      <Td className="text-right tabular-nums">{item.amount}</Td>
                      <Td className="text-right font-medium tabular-nums">
                        {formatCurrency(item.price * (item.amount || 0))}
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </TableWrap>
          </div>

          <dl className="mt-5 ml-auto max-w-sm space-y-1.5 text-base">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
            </div>
            {order.coupon && discount > 0 && (
              <div className="flex justify-between text-positive">
                <dt>Cupom {order.coupon.number}</dt>
                <dd className="tabular-nums">− {formatCurrency(discount)}</dd>
              </div>
            )}
            {order.shippingCost ? (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Frete</dt>
                <dd className="tabular-nums">{formatCurrency(order.shippingCost)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="font-display text-lg font-semibold">Total</dt>
              <dd className="font-display text-xl font-semibold tabular-nums">
                {formatCurrency(subtotal - discount + (order.shippingCost || 0))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 print-none">
          <AssigneePicker order={order} onSaved={load} />
          <StatusChanger order={order} onSaved={load} />
          <OrderStockPanel order={order} onSaved={load} />
          <ShippingPanel order={order} onSaved={load} />
        </div>
      </div>

      <div className="mt-12 print-none">
        <div className="flex gap-1 overflow-x-auto border-b border-line">
          {(
            [
              ['comments', `Comentários (${order.comments?.length ?? 0})`],
              ['history', `Histórico (${order.statusLogs?.length ?? 0})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={
                tab === key
                  ? '-mb-px whitespace-nowrap border-b-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand'
                  : '-mb-px whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink'
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'comments' ? (
            <CommentsTab order={order} onSaved={load} />
          ) : (
            <HistoryTab order={order} />
          )}
        </div>
      </div>
      <Dialog
        open={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        title="Duplicar pedido"
        description={`Criar um novo pedido igual ao #${order.orderId}, com o status Em espera?`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDuplicateOpen(false)}
              disabled={duplicating}
            >
              Cancelar
            </Button>
            <Button onClick={duplicate} disabled={duplicating}>
              {duplicating ? <Spinner className="h-4 w-4" /> : 'Duplicar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Cliente, produtos, entrega, cupom e frete são copiados. Comentários, histórico,
          responsável e retiradas de estoque não, e nenhum e-mail é enviado.
        </p>
      </Dialog>
      <PhoneDialog
        order={order}
        open={editPhoneOpen}
        onClose={() => setEditPhoneOpen(false)}
        onSaved={load}
      />
      <DeliveryDialog
        order={order}
        open={editDeliveryOpen}
        onClose={() => setEditDeliveryOpen(false)}
        onSaved={load}
      />
      <OrderItemsDialog
        order={order}
        open={editItemsOpen}
        onClose={() => setEditItemsOpen(false)}
        onSaved={load}
      />
    </>
  )
}

function PhoneDialog({
  order,
  open,
  onClose,
  onSaved,
}: {
  order: Order
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [phone, setPhone] = useState(order.contactInfo.phone)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setPhone(order.contactInfo.phone)
  }, [open, order.contactInfo.phone])

  const digits = phone.replace(/\D/g, '')
  const invalid = digits.length < 10 || digits.length > 13
  const unchanged = phone.trim() === order.contactInfo.phone

  const save = async () => {
    setSaving(true)
    try {
      await OrdersService.setPhone(order, phone.trim())
      toast.success('Celular atualizado')
      onClose()
      onSaved()
    } catch {
      toast.error('Não foi possível salvar o celular')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar celular de contato"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || invalid || unchanged}>
            {saving ? <Spinner className="h-4 w-4" /> : 'Salvar'}
          </Button>
        </>
      }
    >
      <Input
        label="Celular (com DDD)"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={phone.trim() && invalid ? 'Informe o DDD e o número' : undefined}
      />
    </Dialog>
  )
}

function ShippingPanel({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const initialCost = order.shippingCost
    ? String(order.shippingCost).replace('.', ',')
    : ''
  const [cost, setCost] = useState(initialCost)
  const [notes, setNotes] = useState(order.shippingNotes ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCost(order.shippingCost ? String(order.shippingCost).replace('.', ',') : '')
    setNotes(order.shippingNotes ?? '')
  }, [order.shippingCost, order.shippingNotes])

  const amount = toAmount(cost)
  const invalid =
    cost.trim() !== '' && (amount < 0 || !/^\s*\d+([.,]\d{1,2})?\s*$/.test(cost))
  const dirty =
    amount !== (order.shippingCost || 0) || notes.trim() !== (order.shippingNotes ?? '')

  const save = async () => {
    setSaving(true)
    try {
      await OrdersService.setShipping(order, { cost: amount, notes: notes.trim() })
      toast.success('Frete salvo')
      onSaved()
    } catch {
      toast.error('Não foi possível salvar o frete')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="p-5">
      <h2 className="font-display text-lg font-semibold text-ink">Frete</h2>
      <div className="mt-3 space-y-3">
        <Input
          label="Valor do frete (R$)"
          inputMode="decimal"
          placeholder="0,00"
          value={cost}
          onChange={(event) => setCost(event.target.value)}
          error={invalid ? 'Use só números, por exemplo 18,50' : undefined}
          hint="Entra no total do pedido, que o cliente também vê."
        />
        <Textarea
          label="Detalhes do frete"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Transportadora, código de rastreio, combinado com o cliente…"
          hint="O cliente também vê estes detalhes na página pública do pedido."
        />
        <Button onClick={save} disabled={saving || invalid || !dirty}>
          {saving ? <Spinner className="h-4 w-4" /> : 'Salvar frete'}
        </Button>
      </div>
    </Panel>
  )
}

const statusLabel = (status: string): string =>
  ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status

function StatusChanger({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [status, setStatus] = useState(order.status)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notifyCustomer, setNotifyCustomer] = useState(false)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useLoggedUser()
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignToMe, setAssignToMe] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    setStatus(order.status)
  }, [order.status])

  const openConfirm = () => {
    setNotifyCustomer(false)
    setComment('')
    setAssignToMe(false)
    // Nobody looks after this order yet: offer to take it before changing status.
    if (!order.assignee && user) setAssignOpen(true)
    else setConfirmOpen(true)
  }

  const answerAssign = (assign: boolean) => {
    setAssignToMe(assign)
    setAssignOpen(false)
    setConfirmOpen(true)
  }

  const confirm = async () => {
    setSaving(true)
    try {
      await OrdersService.editOrderStatus(order, status, {
        comment: notifyCustomer ? comment.trim() || undefined : undefined,
        notifyCustomer,
      })
      toast.success(
        notifyCustomer ? 'Status atualizado e cliente avisado' : 'Status atualizado',
      )
      if (assignToMe && user) {
        try {
          const me = { id: user.id ?? user.login, name: user.name }
          await OrdersService.assignOrder(order, me)
          toast.success(`Pedido atribuído a ${me.name}`)
        } catch {
          toast.error('Status atualizado, mas não foi possível atribuir o pedido')
        }
      }
      setConfirmOpen(false)
      onSaved()
    } catch {
      toast.error('Não foi possível atualizar o status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Mudar status</h2>
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          Detalhes
        </button>
      </div>
      <Select
        aria-label="Novo status"
        className="mt-3"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {ORDER_STATUS_DESCRIPTIONS[status] && (
        <p
          key={status}
          className="mt-2 rounded-lg bg-canvas-sunk px-3 py-2 text-sm leading-relaxed text-ink-soft"
        >
          {ORDER_STATUS_DESCRIPTIONS[status]}
        </p>
      )}
      <Button
        className="mt-3 w-full"
        onClick={openConfirm}
        disabled={status === order.status}
      >
        Salvar status
      </Button>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Etapas do pedido"
        description="O que significa cada status."
        footer={
          <Button variant="ghost" onClick={() => setDetailsOpen(false)}>
            Fechar
          </Button>
        }
      >
        <ul className="divide-y divide-line">
          {ORDER_STATUS_OPTIONS.map((option) => (
            <li key={option.value} className="py-3 first:pt-0 last:pb-0">
              <StatusTag status={option.value} />
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {ORDER_STATUS_DESCRIPTIONS[option.value]}
              </p>
            </li>
          ))}
        </ul>
      </Dialog>

      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Este pedido não tem responsável"
        description={`Posso atribuir o pedido a você${user ? ` (${user.name})` : ''} ao mudar o status?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => answerAssign(false)}>
              Não atribuir
            </Button>
            <Button onClick={() => answerAssign(true)}>Sim, atribuir a mim</Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Assim a equipe sabe quem está cuidando deste pedido. Você pode trocar o
          responsável depois.
        </p>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar mudança de status"
        description={`De "${statusLabel(order.status)}" para "${statusLabel(status)}"`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={confirm} disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : 'Confirmar'}
            </Button>
          </>
        }
      >
        <Checkbox
          label="Enviar e-mail para o cliente"
          hint={
            order.contactInfo.email
              ? undefined
              : 'Este pedido não tem e-mail cadastrado, então não é possível notificar o cliente.'
          }
          checked={notifyCustomer}
          disabled={!order.contactInfo.email}
          onChange={(event) => {
            setNotifyCustomer(event.target.checked)
            if (!event.target.checked) setComment('')
          }}
        />
        <Textarea
          label="Comentário (opcional)"
          className="mt-4"
          rows={3}
          disabled={!notifyCustomer}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Alguma mensagem para o cliente sobre essa mudança?"
        />
      </Dialog>
    </Panel>
  )
}

function CommentsTab({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const add = async () => {
    if (!comment.trim()) return
    setSaving(true)
    try {
      await OrdersService.addCommentToOrder(order, comment.trim())
      setComment('')
      onSaved()
    } catch {
      toast.error('Não foi possível salvar o comentário')
    } finally {
      setSaving(false)
    }
  }

  const comments = [...(order.comments ?? [])].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  )

  return (
    <div>
      <Textarea
        label="Novo comentário"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Anote aqui o que a equipe precisa saber sobre este pedido."
      />
      <Button className="mt-2" onClick={add} disabled={saving || !comment.trim()}>
        {saving ? <Spinner className="h-4 w-4" /> : 'Adicionar comentário'}
      </Button>

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">Ainda não há comentários.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {comments.map((entry, index) => (
            <li key={index} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm">
                <strong className="font-semibold text-ink">{entry.userName}</strong>
                <span className="ml-2 text-xs text-ink-muted">
                  {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </p>
              <p className="mt-1.5 text-sm whitespace-pre-line text-ink-soft">
                {entry.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function HistoryTab({ order }: { order: Order }) {
  if (!order.statusLogs?.length) {
    return <p className="text-sm text-ink-muted">Não houve mudança de status.</p>
  }

  return (
    <ul className="space-y-3">
      {order.statusLogs.map((log, index) => {
        // Time spent in the previous status: since the last change, or since
        // the order came in for the first one.
        const since =
          index === 0 ? order.createdAt : order.statusLogs![index - 1].updatedAt
        const elapsed = new Date(log.updatedAt).getTime() - new Date(since).getTime()

        return (
          <li key={index} className="text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-muted tabular-nums">
                {format(new Date(log.updatedAt), 'dd/MM/yyyy HH:mm')}
              </span>
              <strong className="font-semibold text-ink">{log.userName}</strong>
              <span className="text-ink-soft">mudou de</span>
              <StatusTag status={log.oldStatus} />
              <span className="text-ink-soft">para</span>
              <StatusTag status={log.newStatus} />
            </div>
            {Number.isFinite(elapsed) && elapsed >= 0 && (
              <p className="mt-1 text-xs text-ink-muted">
                Ficou <strong className="font-semibold">{formatDuration(elapsed)}</strong>{' '}
                em {orderStatusLabel(log.oldStatus) || 'status anterior'} antes desta
                mudança
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
