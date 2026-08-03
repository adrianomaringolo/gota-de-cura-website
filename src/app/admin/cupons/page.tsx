'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, RadioChip } from '@/components/ui/Field'
import { Badge, EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { useCoupons } from '@/lib/hooks'
import { CouponsService, isCouponValidNow } from '@/services/coupons'

type CouponForm = {
  code: string
  discount: number
  discountType: 'percentage' | 'fixed'
  startDate: string
  endDate: string
}

const formatDate = (value?: string) =>
  value ? format(new Date(value), 'dd/MM/yyyy') : '—'

export default function AdminCouponsPage() {
  const { data, loading, reload } = useCoupons()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponForm>({ defaultValues: { discountType: 'percentage' } })

  const onSubmit = async (values: CouponForm) => {
    try {
      await CouponsService.addCoupon({
        ...values,
        discount: Number(values.discount),
        active: true,
      })
      toast.success('Cupom criado')
      reset({
        discountType: 'percentage',
        code: '',
        discount: 0,
        startDate: '',
        endDate: '',
      })
      setOpen(false)
      await reload()
    } catch {
      toast.error('Não foi possível criar o cupom')
    }
  }

  return (
    <>
      <AdminHeading
        title="Cupons"
        description="Cupons ativos aceitos no carrinho do site."
        actions={<Button onClick={() => setOpen(true)}>Novo cupom</Button>}
      />

      {loading ? (
        <LoadingRows rows={4} />
      ) : data.length === 0 ? (
        <EmptyState title="Nenhum cupom ativo" />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Código</Th>
              <Th>Desconto</Th>
              <Th>Período</Th>
              <Th>Situação</Th>
            </tr>
          </thead>
          <tbody>
            {[...data]
              .sort((a, b) => a.code.localeCompare(b.code, 'pt-BR'))
              .map((coupon) => (
                <tr key={coupon.code}>
                  <Td className="font-mono font-semibold">{coupon.code}</Td>
                  <Td className="tabular-nums">
                    {coupon.discountType === 'fixed'
                      ? `R$ ${coupon.discount}`
                      : `${coupon.discount}%`}
                  </Td>
                  <Td className="text-ink-soft tabular-nums">
                    {formatDate(coupon.startDate)} — {formatDate(coupon.endDate)}
                  </Td>
                  <Td>
                    {isCouponValidNow(coupon) ? (
                      <Badge tone="positive">Válido hoje</Badge>
                    ) : (
                      <Badge tone="neutral">Fora do período</Badge>
                    )}
                  </Td>
                </tr>
              ))}
          </tbody>
        </TableWrap>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Novo cupom"
        description="Deixe as datas em branco para um cupom sem prazo."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button form="coupon-form" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Criar cupom'}
            </Button>
          </>
        }
      >
        <form
          id="coupon-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <Input
            label="Código"
            required
            placeholder="VISITA10"
            hint="Sem espaços. O cliente digita exatamente assim."
            error={errors.code && 'Informe o código.'}
            {...register('code', {
              required: true,
              setValueAs: (value: string) =>
                value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase(),
            })}
          />

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">
              Tipo de desconto
            </legend>
            <div className="flex flex-wrap gap-3">
              <RadioChip
                label="Porcentagem (%)"
                value="percentage"
                {...register('discountType', { required: true })}
              />
              <RadioChip
                label="Valor fixo (R$)"
                value="fixed"
                {...register('discountType', { required: true })}
              />
            </div>
          </fieldset>

          <Input
            label="Valor do desconto"
            type="number"
            step="0.01"
            min="0"
            required
            error={errors.discount && 'Informe o valor.'}
            {...register('discount', { required: true, valueAsNumber: true, min: 0 })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Início" type="date" {...register('startDate')} />
            <Input label="Fim" type="date" {...register('endDate')} />
          </div>
        </form>
      </Dialog>
    </>
  )
}
