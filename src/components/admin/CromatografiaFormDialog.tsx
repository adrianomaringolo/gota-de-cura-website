'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Select } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { CROMATOGRAFIA_LABELS } from '@/lib/constants'
import type { Cromatografia, CromatografiaType } from '@/lib/types'
import { CromatografiasService } from '@/services/cromatografias'

type FormValues = {
  name: string
  scientificName: string
  url: string
  type: CromatografiaType
}

export function CromatografiaFormDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: Cromatografia | null
  onClose: () => void
  onSaved: () => Promise<void> | void
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
        ? {
            name: editing.name,
            scientificName: editing.scientificName,
            url: editing.url,
            type: editing.type,
          }
        : { name: '', scientificName: '', url: '', type: 'oleo-essencial' },
    )
  }, [open, editing, reset])

  const onSubmit = async (data: FormValues) => {
    try {
      if (editing) {
        await CromatografiasService.update(editing.id, data)
        toast.success('Cromatografia atualizada')
      } else {
        await CromatografiasService.save(data)
        toast.success('Cromatografia cadastrada')
      }
      await onSaved()
      onClose()
    } catch {
      toast.error('Não foi possível salvar')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Editar cromatografia' : 'Nova cromatografia'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button form="cromatografia-form" type="submit" disabled={isSubmitting}>
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
        id="cromatografia-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nome"
          required
          placeholder="Lavanda"
          error={errors.name && 'Informe o nome da planta.'}
          {...register('name', { required: true })}
        />
        <Input
          label="Nome científico"
          required
          placeholder="Lavandula angustifolia"
          error={errors.scientificName && 'Informe o nome científico.'}
          {...register('scientificName', { required: true })}
        />
        <Input
          label="URL do laudo (PDF)"
          type="url"
          required
          placeholder="https://…"
          error={errors.url && 'Informe a URL do PDF.'}
          {...register('url', { required: true })}
        />
        <Select label="Tipo" required {...register('type', { required: true })}>
          {(Object.keys(CROMATOGRAFIA_LABELS) as CromatografiaType[]).map((value) => (
            <option key={value} value={value}>
              {CROMATOGRAFIA_LABELS[value]}
            </option>
          ))}
        </Select>
      </form>
    </Dialog>
  )
}
