'use client'

import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AdminHeading, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Badge, EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { useAllTestimonies } from '@/lib/hooks'
import type { Testimony, TestimonyStatus } from '@/lib/types'
import { TestimonyService, testimonyStatus } from '@/services/testimony'

type Filter = TestimonyStatus | 'all'
type Stored = Testimony & { id: string }

const STATUS: Record<
  TestimonyStatus,
  { label: string; tone: 'warning' | 'positive' | 'neutral' }
> = {
  pending: { label: 'Pendente', tone: 'warning' },
  approved: { label: 'Aprovado', tone: 'positive' },
  rejected: { label: 'Recusado', tone: 'neutral' },
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

const SOURCES = ['Instagram', 'WhatsApp', 'Facebook', 'E-mail', 'Pessoalmente', 'Outro']

const today = () => format(new Date(), 'yyyy-MM-dd')

type CreateForm = {
  name: string
  city: string
  message: string
  source: string
  date: string
  publish: boolean
}

type EditForm = { name: string; city: string; message: string }

export default function AdminTestimoniesPage() {
  const { data, loading, reload } = useAllTestimonies()
  const [filter, setFilter] = useState<Filter>('pending')
  const [editing, setEditing] = useState<Stored | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const stored = useMemo(
    () => data.filter((testimony): testimony is Stored => Boolean(testimony.id)),
    [data],
  )

  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
      all: stored.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    }
    for (const testimony of stored) result[testimonyStatus(testimony)]++
    return result
  }, [stored])

  const visible = stored.filter(
    (testimony) => filter === 'all' || testimonyStatus(testimony) === filter,
  )

  const moderate = async (testimony: Stored, status: TestimonyStatus) => {
    setBusy(testimony.id)
    try {
      await TestimonyService.setStatus(testimony.id, status)
      toast.success(
        status === 'approved'
          ? 'Depoimento aprovado — já aparece na página inicial'
          : status === 'rejected'
            ? 'Depoimento recusado'
            : 'Depoimento voltou para pendentes',
      )
      await reload()
    } catch {
      toast.error('Não foi possível atualizar o depoimento')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (id: string) => {
    try {
      await TestimonyService.remove(id)
      toast.success('Depoimento excluído')
      setConfirmDelete(null)
      await reload()
    } catch {
      toast.error('Não foi possível excluir')
    }
  }

  return (
    <>
      <AdminHeading
        title="Depoimentos"
        description="Depoimentos enviados pelo formulário do site ou recebidos por outros canais. Só os aprovados aparecem na página inicial."
        actions={<Button onClick={() => setCreating(true)}>Novo depoimento</Button>}
      />

      <div
        role="tablist"
        aria-label="Filtrar por situação"
        className="mb-5 flex flex-wrap gap-2"
      >
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => setFilter(item.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              filter === item.value
                ? 'border-brand bg-brand-tint text-brand'
                : 'border-line bg-surface text-ink-soft hover:border-brand/50',
            )}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[item.value]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingRows rows={5} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            filter === 'pending'
              ? 'Nenhum depoimento aguardando aprovação'
              : 'Nenhum depoimento aqui'
          }
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Quem enviou</Th>
              <Th>Depoimento</Th>
              <Th>Situação</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((testimony) => {
              const status = testimonyStatus(testimony)
              const blocked = testimony.authorized === false
              const working = busy === testimony.id

              return (
                <tr key={testimony.id} className="align-top">
                  <Td className="min-w-40">
                    <span className="font-medium">{testimony.name}</span>
                    <span className="block text-xs text-ink-muted">
                      {testimony.city && <>{testimony.city} · </>}
                      <span className="tabular-nums">
                        {format(new Date(testimony.sentAt), 'dd/MM/yyyy')}
                      </span>
                    </span>
                    {testimony.source && (
                      <Badge tone="lab" className="mt-1.5">
                        {testimony.source}
                      </Badge>
                    )}
                  </Td>
                  <Td className="max-w-lg">
                    <p className="line-clamp-4 whitespace-pre-line text-ink-soft">
                      {testimony.message}
                    </p>
                    {testimony.originalMessage && (
                      <span className="mt-1 block text-xs text-ink-muted">
                        Texto editado pela equipe
                      </span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>
                      {blocked && <Badge tone="danger">Não autorizou a publicação</Badge>}
                    </div>
                  </Td>
                  <Td className="text-right">
                    {confirmDelete === testimony.id ? (
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          className="bg-danger hover:bg-danger/85"
                          onClick={() => remove(testimony.id)}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {status !== 'approved' && (
                          <Button
                            size="sm"
                            disabled={blocked || working}
                            title={
                              blocked ? 'A pessoa não autorizou a publicação' : undefined
                            }
                            onClick={() => moderate(testimony, 'approved')}
                          >
                            {working ? <Spinner className="h-4 w-4" /> : 'Aprovar'}
                          </Button>
                        )}
                        {status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={working}
                            onClick={() => moderate(testimony, 'pending')}
                          >
                            Tirar do site
                          </Button>
                        )}
                        {status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={working}
                            onClick={() => moderate(testimony, 'rejected')}
                          >
                            Recusar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(testimony)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(testimony.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      <CreateDialog open={creating} onClose={() => setCreating(false)} onSaved={reload} />

      <EditDialog
        key={editing?.id ?? 'closed'}
        testimony={editing}
        onClose={() => setEditing(null)}
        onSaved={reload}
      />
    </>
  )
}

function EditDialog({
  testimony,
  onClose,
  onSaved,
}: {
  testimony: Stored | null
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    values: {
      name: testimony?.name ?? '',
      city: testimony?.city ?? '',
      message: testimony?.message ?? '',
    },
  })

  const onSubmit = async (values: EditForm) => {
    if (!testimony) return
    try {
      await TestimonyService.edit(testimony, values)
      toast.success('Depoimento atualizado')
      onClose()
      await onSaved()
    } catch {
      toast.error('Não foi possível salvar')
    }
  }

  return (
    <Dialog
      open={Boolean(testimony)}
      onClose={onClose}
      title="Editar depoimento"
      description="Ajuste só o necessário (erros de digitação, por exemplo). O texto original fica guardado."
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button form="testimony-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Salvar'}
          </Button>
        </>
      }
    >
      <form
        id="testimony-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nome"
          required
          error={errors.name && 'Informe o nome.'}
          {...register('name', { required: true })}
        />
        <Input label="Cidade/Estado" {...register('city')} />
        <Textarea
          label="Depoimento"
          required
          rows={8}
          error={errors.message && 'Informe o depoimento.'}
          {...register('message', { required: true })}
        />
        {testimony?.originalMessage && (
          <details className="rounded-xl bg-canvas-sunk px-4 py-3 text-sm text-ink-soft">
            <summary className="cursor-pointer font-medium text-ink">
              Ver texto original
            </summary>
            <p className="mt-2 whitespace-pre-line">{testimony.originalMessage}</p>
          </details>
        )}
      </form>
    </Dialog>
  )
}

function CreateDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    defaultValues: { source: 'Instagram', date: today(), publish: true },
  })

  const close = () => {
    reset({
      source: 'Instagram',
      date: today(),
      publish: true,
      name: '',
      city: '',
      message: '',
    })
    onClose()
  }

  const onSubmit = async (values: CreateForm) => {
    try {
      await TestimonyService.create({
        name: values.name,
        city: values.city,
        message: values.message,
        source: values.source,
        // Noon avoids the date slipping a day when read back in another timezone.
        sentAt: new Date(`${values.date || today()}T12:00:00`).toISOString(),
        publish: values.publish,
      })
      toast.success(
        values.publish
          ? 'Depoimento criado e publicado'
          : 'Depoimento criado como pendente',
      )
      close()
      await onSaved()
    } catch {
      toast.error('Não foi possível criar o depoimento')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Novo depoimento"
      description="Para depoimentos recebidos fora do formulário do site: Instagram, WhatsApp, pessoalmente…"
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button form="testimony-create-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Criar depoimento'}
          </Button>
        </>
      }
    >
      <form
        id="testimony-create-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nome"
          required
          error={errors.name && 'Informe o nome.'}
          {...register('name', { required: true })}
        />
        <Input label="Cidade/Estado" {...register('city')} />
        <Textarea
          label="Depoimento"
          required
          rows={6}
          error={errors.message && 'Informe o depoimento.'}
          {...register('message', { required: true })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Origem" {...register('source')}>
            {SOURCES.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </Select>
          <Input label="Data em que foi enviado" type="date" {...register('date')} />
        </div>
        <Checkbox
          label="Publicar na página inicial agora"
          hint="Ao criar, você confirma que a pessoa autorizou a publicação. Desmarque para revisar antes."
          {...register('publish')}
        />
      </form>
    </Dialog>
  )
}
