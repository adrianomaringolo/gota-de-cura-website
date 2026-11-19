'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import type { Visit } from '@/lib/types'
import { VisitsService } from '@/services/visits'

type FormValues = { date: string; value: string }

export function VisitFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: Visit | null
  onClose: () => void
  onSaved: (date: string) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  useEffect(() => {
    if (!open) return
    reset(
      editing
        ? { date: editing.date, value: String(editing.value ?? 0) }
        : { date: '', value: '0' },
    )
  }, [open, editing, reset])

  const onSubmit = async (data: FormValues) => {
    const input = { date: data.date, value: Number(data.value.replace(',', '.')) || 0 }
    try {
      if (editing) {
        await VisitsService.update(editing.date, input)
        toast.success('Visita atualizada')
      } else {
        await VisitsService.save(input)
        toast.success('Visita cadastrada')
      }
      await onSaved(input.date)
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === 'visit-exists'
          ? 'Já existe uma visita nesta data'
          : 'Não foi possível salvar',
      )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Editar visita' : 'Nova visita'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button form="visit-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : editing ? (
              'Atualizar'
            ) : (
              'Cadastrar'
            )}
          </Button>
        </>
      }
    >
      <form
        id="visit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Data da visita"
          type="date"
          required
          hint={
            editing?.enrollments?.length
              ? 'As inscrições já recebidas acompanham a nova data.'
              : undefined
          }
          error={errors.date && 'Informe a data.'}
          {...register('date', { required: true })}
        />
        <Input
          label="Valor (R$)"
          inputMode="decimal"
          hint="Use 0 para visita gratuita."
          error={errors.value && 'Informe o valor.'}
          {...register('value', { required: true })}
        />
      </form>
    </Dialog>
  )
}
