'use client'

import { useId, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { useLoggedUser, useManagedUsers } from '@/lib/hooks'
import { cn } from '@/lib/cn'
import type { Order, OrderAssignee } from '@/lib/types'
import { OrdersService } from '@/services/orders'
import { Panel } from './AdminUI'
import { UserAvatar } from './UserAvatar'

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export function AssigneePicker({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const listId = useId()
  const { user } = useLoggedUser()
  const { data: users } = useManagedUsers()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const current = order.assignee
  const lastUser = order.statusLogs?.at(-1)?.userName

  const options = useMemo(() => {
    const term = normalize(query.trim())
    const people = (users ?? [])
      .filter((entry) => !entry.archived && (entry.name || entry.login))
      .map((entry) => ({ id: entry.id, name: entry.name || entry.login }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .filter((entry) => !term || normalize(entry.name).includes(term))
    return people
  }, [users, query])

  const showNone = !query.trim() || normalize('Sem responsável').includes(normalize(query))

  const save = async (assignee: OrderAssignee | null) => {
    setSaving(true)
    try {
      await OrdersService.assignOrder(order, assignee)
      toast.success(assignee ? `Pedido atribuído a ${assignee.name}` : 'Responsável removido')
      setQuery('')
      setOpen(false)
      onSaved()
    } catch {
      toast.error('Não foi possível atribuir o pedido')
    } finally {
      setSaving(false)
    }
  }

  const me: OrderAssignee | null = user
    ? { id: user.id ?? user.login, name: user.name }
    : null
  const assignedToMe = Boolean(me && current && current.id === me.id)

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Responsável</h2>
        {me && !assignedToMe && (
          <button
            type="button"
            disabled={saving}
            onClick={() => void save(me)}
            className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand disabled:opacity-50"
          >
            Atribuir para mim
          </button>
        )}
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm text-ink">
        {current ? (
          <>
            <UserAvatar name={current.name} />
            <span className="font-medium">{current.name}</span>
          </>
        ) : current === null || !lastUser ? (
          <span className="text-ink-muted">Sem responsável</span>
        ) : (
          <span className="text-ink-muted">
            {lastUser} <span className="text-xs">(última alteração de status)</span>
          </span>
        )}
        {saving && <Spinner className="h-4 w-4" />}
      </p>

      <div className="relative mt-3">
        <Input
          aria-label="Buscar responsável"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Buscar pessoa…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
        />
        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg"
          >
            {showNone && (
              <li role="option" aria-selected={current === null}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void save(null)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-soft hover:bg-canvas-sunk',
                    current === null && 'font-semibold',
                  )}
                >
                  Sem responsável
                </button>
              </li>
            )}
            {options.map((option) => (
              <li key={option.id} role="option" aria-selected={current?.id === option.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void save(option)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-canvas-sunk',
                    current?.id === option.id && 'font-semibold',
                  )}
                >
                  <UserAvatar name={option.name} />
                  {option.name}
                </button>
              </li>
            ))}
            {!showNone && options.length === 0 && (
              <li className="px-3 py-2 text-sm text-ink-muted">Ninguém encontrado.</li>
            )}
          </ul>
        )}
      </div>
    </Panel>
  )
}
