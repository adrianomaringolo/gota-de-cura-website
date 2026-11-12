'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, RadioChip } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { maskCpf, maskZipcode } from '@/lib/format'
import type { DeliveryInfo, Order, ShippingAddress } from '@/lib/types'
import { OrdersService } from '@/services/orders'

type ViaCep = {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

const emptyAddress: ShippingAddress = {
  cpf: '',
  zipcode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
}

const addressOf = (delivery?: DeliveryInfo): ShippingAddress =>
  delivery?.method === 'shipping' ? { ...emptyAddress, ...delivery } : emptyAddress

export function DeliveryDialog({
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
  const [method, setMethod] = useState<DeliveryInfo['method']>(
    order.delivery?.method ?? 'pickup',
  )
  const [address, setAddress] = useState<ShippingAddress>(addressOf(order.delivery))
  const [lookup, setLookup] = useState<'idle' | 'loading' | 'notFound'>('idle')
  const [saving, setSaving] = useState(false)
  const lastLookup = useRef('')

  // Start from the order's current delivery every time the dialog opens.
  useEffect(() => {
    if (!open) return
    setMethod(order.delivery?.method ?? 'pickup')
    setAddress(addressOf(order.delivery))
    setLookup('idle')
    lastLookup.current = ''
  }, [open, order.delivery])

  const set = (patch: Partial<ShippingAddress>) =>
    setAddress((current) => ({ ...current, ...patch }))

  const searchZipcode = async (masked: string) => {
    const digits = masked.replace(/\D/g, '')
    if (digits.length !== 8 || digits === lastLookup.current) return
    lastLookup.current = digits
    setLookup('loading')
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data: ViaCep = await response.json()
      if (data.erro) {
        setLookup('notFound')
        return
      }
      set({
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      })
      setLookup('idle')
    } catch {
      setLookup('notFound')
    }
  }

  const invalidAddress =
    method === 'shipping' &&
    (address.cpf.replace(/\D/g, '').length !== 11 ||
      address.zipcode.replace(/\D/g, '').length !== 8 ||
      !address.street.trim() ||
      !address.number.trim() ||
      !address.neighborhood.trim() ||
      !address.city.trim() ||
      address.state.trim().length !== 2)

  const delivery: DeliveryInfo =
    method === 'pickup' ? { method: 'pickup' } : { method: 'shipping', ...address }

  const unchanged =
    JSON.stringify(delivery) === JSON.stringify(order.delivery ?? { method: 'pickup' })

  const save = async () => {
    setSaving(true)
    try {
      await OrdersService.setDelivery(order, delivery)
      toast.success('Entrega atualizada')
      onClose()
      onSaved()
    } catch {
      toast.error('Não foi possível salvar a entrega')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar forma de entrega"
      description="A mudança fica registrada nos comentários do pedido."
      size="md"
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || invalidAddress || unchanged}>
            {saving ? <Spinner className="h-4 w-4" /> : 'Salvar'}
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="Forma de entrega" className="flex gap-3">
        <RadioChip
          label="Retira na loja"
          name="delivery-method"
          checked={method === 'pickup'}
          onChange={() => setMethod('pickup')}
        />
        <RadioChip
          label="Envio"
          name="delivery-method"
          checked={method === 'shipping'}
          onChange={() => setMethod('shipping')}
        />
      </div>

      {method === 'shipping' && (
        <div className="mt-5 grid gap-4 sm:grid-cols-6">
          <Input
            label="CPF"
            inputMode="numeric"
            placeholder="123.456.789-00"
            hint="Exigido pelas transportadoras para gerar a etiqueta de envio."
            className="sm:col-span-3"
            value={address.cpf}
            onChange={(event) => set({ cpf: maskCpf(event.target.value) })}
          />
          <Input
            label="CEP"
            inputMode="numeric"
            placeholder="13024-000"
            className="sm:col-span-2"
            value={address.zipcode}
            hint={lookup === 'loading' ? 'Buscando endereço…' : undefined}
            error={lookup === 'notFound' ? 'CEP não encontrado' : undefined}
            onChange={(event) => {
              const masked = maskZipcode(event.target.value)
              set({ zipcode: masked })
              if (masked.replace(/\D/g, '').length < 8) {
                lastLookup.current = ''
                setLookup('idle')
              }
              void searchZipcode(masked)
            }}
          />
          <Input
            label="Rua"
            className="sm:col-span-4"
            value={address.street}
            onChange={(event) => set({ street: event.target.value })}
          />
          <Input
            label="Número"
            inputMode="numeric"
            className="sm:col-span-2"
            value={address.number}
            onChange={(event) => set({ number: event.target.value })}
          />
          <Input
            label="Complemento"
            className="sm:col-span-4"
            value={address.complement ?? ''}
            onChange={(event) => set({ complement: event.target.value })}
          />
          <Input
            label="Bairro"
            className="sm:col-span-2"
            value={address.neighborhood}
            onChange={(event) => set({ neighborhood: event.target.value })}
          />
          <Input
            label="Cidade"
            className="sm:col-span-3"
            value={address.city}
            onChange={(event) => set({ city: event.target.value })}
          />
          <Input
            label="UF"
            maxLength={2}
            placeholder="SP"
            className="sm:col-span-1"
            value={address.state}
            onChange={(event) =>
              set({ state: event.target.value.toUpperCase().replace(/[^A-Z]/g, '') })
            }
          />
        </div>
      )}
    </Dialog>
  )
}
