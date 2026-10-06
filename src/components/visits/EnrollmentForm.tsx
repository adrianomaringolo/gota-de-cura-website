'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { Dialog } from '@/components/ui/Dialog'
import { Checkbox, Input, RadioChip } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { useRouter } from '@/i18n/navigation'
import { useVisits } from '@/lib/hooks'
import { formatVisitDateLong, maskPhone } from '@/lib/format'
import type { EnrollmentData } from '@/lib/types'
import { EmailSender } from '@/services/email'
import { visitMailList } from '@/services/maillist'
import { isUpcoming, VisitsService } from '@/services/visits'
import { PaymentTerms } from './PaymentTerms'

type FormValues = {
  visitDate: string
  name: string
  cellphone: string
  email: string
  companions: { name: string }[]
  lastVisit: string
  agreed: boolean
}

function Step({
  number,
  title,
  hint,
  children,
}: {
  number: number
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-line pt-8">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-tint font-display text-lg font-semibold text-brand"
        >
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </section>
  )
}

export function EnrollmentForm() {
  const t = useTranslations('enrollment')
  const locale = useLocale()
  const router = useRouter()
  const { data: visits, loading } = useVisits()
  const upcoming = visits.filter((visit) => isUpcoming(visit))

  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { companions: [], visitDate: '', agreed: false },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'companions' })
  const agreed = watch('agreed')

  const submit = async () => {
    const values = getValues()
    setSaving(true)

    const enrollment: EnrollmentData = {
      name: values.name,
      cellphone: values.cellphone,
      email: values.email,
      companions: values.companions.map((companion) => companion.name).filter(Boolean),
      lastVisit: values.lastVisit,
      ...(locale !== 'pt-BR' && { locale }),
    }

    try {
      await VisitsService.addEnrollmentToVisit(values.visitDate, enrollment)

      // Notifications must not block a saved enrollment.
      void EmailSender.sendNewEnrollmentEmail(
        values.visitDate,
        enrollment,
        visitMailList,
      ).catch(() => undefined)
      void EmailSender.sendEnrollmentGreetingEmail(
        enrollment.name.split(' ')[0],
        [enrollment.email],
        locale,
      ).catch(() => undefined)

      setConfirming(false)
      setDone(true)
    } catch (error) {
      console.error(error)
      toast.error(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const values = getValues()

  return (
    <Container className="max-w-3xl pt-32 pb-24 lg:pt-40">
      <h1 className="text-3xl font-semibold text-ink">{t('metaTitle')}</h1>
      <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-soft">
        {t('intro')}
      </p>

      <form
        className="mt-12 space-y-8"
        onSubmit={handleSubmit(() => setConfirming(true))}
        noValidate
      >
        <Step number={1} title={t('step1')}>
          {loading ? (
            <div className="flex gap-2" aria-hidden="true">
              {Array.from({ length: 2 }).map((_, index) => (
                <span
                  key={index}
                  className="h-14 w-48 animate-pulse rounded-xl bg-canvas-sunk"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="rounded-xl bg-warning-tint px-4 py-3 text-base text-ink">
              {t('noDates')}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                {upcoming.map((visit) => (
                  <RadioChip
                    key={visit.id ?? visit.date}
                    value={visit.date}
                    label={formatVisitDateLong(visit.date, locale)}
                    {...register('visitDate', { required: true })}
                  />
                ))}
              </div>
              {errors.visitDate && (
                <p role="alert" className="mt-2 text-xs font-medium text-danger">
                  {t('dateError')}
                </p>
              )}
            </>
          )}
        </Step>

        <Step number={2} title={t('step2')}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={t('name')}
              required
              autoComplete="name"
              className="sm:col-span-2"
              error={errors.name && t('nameError')}
              {...register('name', { required: true, minLength: 3 })}
            />
            <Input
              label={t('phone')}
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="(19) 99999-9999"
              hint={t('phoneHint')}
              error={errors.cellphone && t('phoneError')}
              {...register('cellphone', {
                required: true,
                pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                onChange: (event) => setValue('cellphone', maskPhone(event.target.value)),
              })}
            />
            <Input
              label={t('email')}
              type="email"
              required
              autoComplete="email"
              error={errors.email && t('emailError')}
              {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
            />
          </div>
        </Step>

        <Step number={3} title={t('step3')} hint={t('step3Hint')}>
          {fields.length > 0 && (
            <ul className="mb-4 space-y-3">
              {fields.map((field, index) => (
                <li key={field.id} className="flex items-end gap-2">
                  <Input
                    label={t('companion', { number: index + 1 })}
                    className="flex-1"
                    error={errors.companions?.[index]?.name && t('companionError')}
                    {...register(`companions.${index}.name` as const, { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger"
                    aria-label={t('removeCompanion', { number: index + 1 })}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button type="button" variant="outline" onClick={() => append({ name: '' })}>
            {t('addCompanion')}
          </Button>
        </Step>

        <Step number={4} title={t('step4')} hint={t('step4Hint')}>
          <Input
            label={t('lastVisit')}
            placeholder={t('lastVisitPlaceholder')}
            {...register('lastVisit')}
          />
        </Step>

        <div className="border-t border-line pt-8">
          <Checkbox
            label={t.rich('agree', {
              terms: (chunks) => (
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-brand underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
                >
                  {chunks}
                </button>
              ),
            })}
            {...register('agreed', { required: true })}
          />

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <ButtonLink href="/visitas" variant="ghost">
              {t('back')}
            </ButtonLink>
            <Button type="submit" size="lg" disabled={!agreed || upcoming.length === 0}>
              {t('review')}
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('confirmTitle')}
        description={t('confirmDescription')}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={saving}
            >
              {t('edit')}
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? (
                <>
                  <Spinner className="h-4 w-4" /> {t('sending')}
                </>
              ) : (
                t('confirm')
              )}
            </Button>
          </>
        }
      >
        <p className="rounded-xl bg-warning-tint px-4 py-3 text-sm text-ink">
          {t('checkPhone')}
        </p>

        <dl className="mt-5 space-y-2 text-base">
          {[
            [t('summaryDate'), formatVisitDateLong(values.visitDate, locale)],
            [t('summaryName'), values.name],
            [t('summaryPhone'), values.cellphone],
            [t('email'), values.email],
            [
              t('step3'),
              values.companions?.map((companion) => companion.name).join(', ') || '—',
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2 border-b border-line pb-2">
              <dt className="w-32 shrink-0 text-ink-muted">{label}</dt>
              <dd className="min-w-0 flex-1 break-words text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Dialog>

      <Dialog
        open={done}
        onClose={() => router.push('/visitas')}
        title={t('doneTitle')}
        dismissible={false}
        footer={<Button onClick={() => router.push('/visitas')}>{t('doneBack')}</Button>}
      >
        <p className="text-base leading-relaxed text-ink-soft">{t('doneBody')}</p>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{t('doneEmail')}</p>
      </Dialog>

      <Dialog
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        title={t('termsTitle')}
        footer={<Button onClick={() => setTermsOpen(false)}>{t('gotIt')}</Button>}
      >
        <PaymentTerms />
      </Dialog>
    </Container>
  )
}
