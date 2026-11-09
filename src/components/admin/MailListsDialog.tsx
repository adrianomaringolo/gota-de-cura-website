'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { invalidEmails, MailListsService, parseEmails } from '@/services/maillist'

export function MailListsDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [orders, setOrders] = useState('')
  const [visits, setVisits] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError('')
    setLoading(true)
    MailListsService.get()
      .then((lists) => {
        if (cancelled) return
        setOrders(lists.orders.join('\n'))
        setVisits(lists.visits.join('\n'))
      })
      .catch(() => {
        if (!cancelled)
          setError('Não foi possível carregar as listas. Feche e tente de novo.')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [open])

  const save = async () => {
    const orderList = parseEmails(orders)
    const visitList = parseEmails(visits)
    const invalid = invalidEmails([...orderList, ...visitList])
    if (invalid.length) {
      setError(`E-mail inválido: ${invalid.join(', ')}`)
      return
    }
    setSaving(true)
    setError('')
    try {
      await MailListsService.save({ orders: orderList, visits: visitList })
      toast.success('Listas de e-mail salvas')
      onClose()
    } catch {
      setError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!saving) onClose()
      }}
      closeOnBackdrop={false}
      title="Listas de e-mail"
      description="Quem recebe os avisos da equipe. Um e-mail por linha."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={saving || loading || Boolean(error && !orders && !visits)}
          >
            {saving ? <Spinner className="h-4 w-4" /> : 'Salvar'}
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="grid place-items-center py-10">
          <Spinner className="text-brand" />
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            label="Novos pedidos"
            hint="Avisados a cada novo pedido e quando um pedido fica parado sem responsável identificado."
            rows={6}
            spellCheck={false}
            autoCapitalize="none"
            value={orders}
            onChange={(event) => setOrders(event.target.value)}
          />
          <Textarea
            label="Inscrições em visitas"
            hint="Avisados a cada nova inscrição em uma visita."
            rows={4}
            spellCheck={false}
            autoCapitalize="none"
            value={visits}
            onChange={(event) => setVisits(event.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </Dialog>
  )
}
