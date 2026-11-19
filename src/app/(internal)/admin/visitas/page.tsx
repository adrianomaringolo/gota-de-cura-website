'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AdminHeading, StatValue, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { VisitFormDialog } from '@/components/admin/VisitFormDialog'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input, Select } from '@/components/ui/Field'
import { EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { useVisits } from '@/lib/hooks'
import { formatCurrency, formatVisitDateLong } from '@/lib/format'
import type { Visit } from '@/lib/types'
import { EmailSender } from '@/services/email'
import { isUpcoming, VisitsService } from '@/services/visits'

type ThankForm = { visitorName: string; visitorEmail: string; bcc: string }

export default function AdminVisitsPage() {
  const { data: visits, loading, reload } = useVisits()
  const [date, setDate] = useState('')
  const [thankOpen, setThankOpen] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Visit | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selected = useMemo(
    () => visits.find((visit) => visit.date === date),
    [visits, date],
  )

  const listed = useMemo(
    () => visits.filter((visit) => showPast || isUpcoming(visit)),
    [visits, showPast],
  )

  const enrollments = selected?.enrollments ?? []
  const totalPeople = enrollments.reduce(
    (sum, entry) => sum + 1 + (entry.companions?.length ?? 0),
    0,
  )

  const remove = async () => {
    if (!selected) return
    try {
      await VisitsService.remove(selected.date)
      toast.success('Visita removida')
      setConfirmDelete(false)
      setDate('')
      await reload()
    } catch {
      toast.error('Não foi possível remover')
    }
  }

  return (
    <>
      <AdminHeading
        title="Visitas"
        description="Inscrições recebidas pelo site, por data de visitação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              Nova visita
            </Button>
            <Button onClick={() => setThankOpen(true)}>E-mail de agradecimento</Button>
          </div>
        }
      />

      {loading ? (
        <LoadingRows rows={4} />
      ) : (
        <>
          <Checkbox
            label="Mostrar visitas anteriores"
            checked={showPast}
            onChange={(event) => {
              setShowPast(event.target.checked)
              if (!event.target.checked && selected && !isUpcoming(selected)) {
                setDate('')
                setConfirmDelete(false)
              }
            }}
            className="mb-3"
          />
          <div className="mb-8 flex flex-wrap items-end gap-3">
            <Select
              label="Data da visita"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setConfirmDelete(false)
              }}
              className="w-full max-w-sm"
            >
              <option value="">— escolha uma data —</option>
              {[...listed]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((visit) => (
                  <option key={visit.date} value={visit.date}>
                    {formatVisitDateLong(visit.date)} ({visit.enrollments?.length ?? 0}{' '}
                    inscrições)
                  </option>
                ))}
            </Select>
            {selected &&
              (confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-ink-soft">
                    {enrollments.length > 0
                      ? `Apaga também ${enrollments.length} inscrição(ões).`
                      : 'Excluir esta visita?'}
                  </span>
                  <Button
                    size="sm"
                    className="bg-danger hover:bg-danger/85"
                    onClick={remove}
                  >
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(selected)
                      setFormOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Excluir
                  </Button>
                </div>
              ))}
          </div>

          {selected && (
            <p className="-mt-4 mb-6 text-sm text-ink-soft">
              Valor da visitação:{' '}
              <strong className="font-semibold text-ink">
                {selected.value ? formatCurrency(selected.value) : 'Gratuita'}
              </strong>
            </p>
          )}

          {!selected ? (
            <EmptyState title="Escolha uma data para ver os inscritos" />
          ) : enrollments.length === 0 ? (
            <EmptyState title="Ainda não há inscrições para esta data" />
          ) : (
            <>
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <StatValue label="Inscrições" value={enrollments.length} />
                <StatValue label="Pessoas no total" value={totalPeople} tone="brand" />
                <StatValue
                  label="Acompanhantes"
                  value={totalPeople - enrollments.length}
                />
              </div>

              <TableWrap>
                <thead>
                  <tr>
                    <Th className="w-12">#</Th>
                    <Th>Nome</Th>
                    <Th>Celular</Th>
                    <Th>E-mail</Th>
                    <Th>Acompanhantes</Th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((entry, index) => (
                    <tr key={`${entry.email}-${index}`}>
                      <Td className="text-ink-muted tabular-nums">{index + 1}</Td>
                      <Td className="font-medium">
                        {entry.name}
                        {entry.locale === 'en' && (
                          <span className="ml-2 text-xs font-semibold text-lab">EN</span>
                        )}
                      </Td>
                      <Td className="tabular-nums">{entry.cellphone}</Td>
                      <Td className="break-all text-ink-soft">{entry.email}</Td>
                      <Td className="text-ink-soft">
                        {entry.companions?.length ? entry.companions.join(', ') : '—'}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </>
          )}
        </>
      )}

      <VisitFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async (saved) => {
          await reload()
          if (!isUpcoming({ date: saved } as Visit)) setShowPast(true)
          setDate(saved)
        }}
      />
      <ThankEmailDialog open={thankOpen} onClose={() => setThankOpen(false)} />
    </>
  )
}

function ThankEmailDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ThankForm>()

  const onSubmit = async (values: ThankForm) => {
    try {
      await EmailSender.sendVisitThankEmail(
        values.visitorName,
        values.visitorEmail,
        values.bcc,
      )
      toast.success(`E-mail enviado para ${values.visitorName}`)
      reset({ visitorName: '', visitorEmail: '', bcc: values.bcc })
      setFocus('visitorName')
    } catch {
      toast.error('Não foi possível enviar o e-mail')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="E-mail de agradecimento"
      closeOnBackdrop={false}
      description="Envia o texto padrão de agradecimento pela visita. O formulário fica aberto para o próximo visitante."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </Button>
          <Button form="thank-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Enviar'}
          </Button>
        </>
      }
    >
      <form
        id="thank-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nome do visitante"
          required
          error={errors.visitorName && 'Informe o nome.'}
          {...register('visitorName', { required: true })}
        />
        <Input
          label="E-mail do visitante"
          type="email"
          required
          error={errors.visitorEmail && 'Informe um e-mail válido.'}
          {...register('visitorEmail', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
        />
        <Input
          label="Cópia oculta (BCC)"
          hint="Separe vários e-mails por vírgula."
          {...register('bcc')}
        />
      </form>
    </Dialog>
  )
}
