'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { AdminHeading, StatValue, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Select } from '@/components/ui/Field'
import { EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { useVisits } from '@/lib/hooks'
import { formatVisitDateLong } from '@/lib/format'
import { EmailSender } from '@/services/email'

type ThankForm = { visitorName: string; visitorEmail: string; bcc: string }

export default function AdminVisitsPage() {
  const { data: visits, loading } = useVisits()
  const [date, setDate] = useState('')
  const [thankOpen, setThankOpen] = useState(false)

  const selected = useMemo(
    () => visits.find((visit) => visit.date === date),
    [visits, date],
  )

  const enrollments = selected?.enrollments ?? []
  const totalPeople = enrollments.reduce(
    (sum, entry) => sum + 1 + (entry.companions?.length ?? 0),
    0,
  )

  return (
    <>
      <AdminHeading
        title="Visitas"
        description="Inscrições recebidas pelo site, por data de visitação."
        actions={
          <Button onClick={() => setThankOpen(true)}>E-mail de agradecimento</Button>
        }
      />

      {loading ? (
        <LoadingRows rows={4} />
      ) : (
        <>
          <Select
            label="Data da visita"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mb-8 max-w-sm"
          >
            <option value="">— escolha uma data —</option>
            {[...visits]
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((visit) => (
                <option key={visit.date} value={visit.date}>
                  {formatVisitDateLong(visit.date)} ({visit.enrollments?.length ?? 0}{' '}
                  inscrições)
                </option>
              ))}
          </Select>

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
                      <Td className="font-medium">{entry.name}</Td>
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
