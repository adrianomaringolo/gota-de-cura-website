'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Container } from '@/components/site/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Feedback'
import { Input, RadioChip, Textarea } from '@/components/ui/Field'
import { TestimonyService } from '@/services/testimony'

type FormValues = {
  name: string
  city: string
  message: string
  authorized: 'yes' | 'no'
}

export function TestimonyForm() {
  const t = useTranslations('testimonyForm')
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { authorized: 'yes' } })

  const onSubmit = async (values: FormValues) => {
    try {
      await TestimonyService.submit({
        name: values.name,
        city: values.city,
        message: values.message,
        authorized: values.authorized === 'yes',
      })
      setDone(true)
    } catch (error) {
      console.error(error)
      toast.error(t('error'))
    }
  }

  if (done) {
    return (
      <Container className="max-w-2xl pt-32 pb-24 text-center lg:pt-40">
        <h1 className="text-3xl font-semibold text-ink">{t('doneTitle')}</h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft">
          {t('doneBody')}
        </p>
        <ButtonLink href="/" className="mt-10">
          {t('back')}
        </ButtonLink>
      </Container>
    )
  }

  return (
    <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
      <h1 className="text-3xl font-semibold text-ink">{t('title')}</h1>
      <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-soft">
        {t('intro')}
      </p>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label={t('name')}
          required
          autoComplete="name"
          error={errors.name && t('nameError')}
          {...register('name', { required: true, validate: (v) => v.trim().length >= 2 })}
        />

        <Input
          label={t('city')}
          autoComplete="address-level2"
          placeholder={t('cityPlaceholder')}
          {...register('city')}
        />

        <Textarea
          label={t('message')}
          required
          rows={7}
          maxLength={2000}
          error={errors.message && t('messageError')}
          {...register('message', {
            required: true,
            validate: (v) => v.trim().length >= 10,
          })}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">{t('authorize')}</legend>
          <div className="flex flex-wrap gap-3">
            <RadioChip label={t('yes')} value="yes" {...register('authorized')} />
            <RadioChip label={t('no')} value="no" {...register('authorized')} />
          </div>
        </fieldset>

        <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-6">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" /> {t('sending')}
              </>
            ) : (
              t('send')
            )}
          </Button>
        </div>
      </form>
    </Container>
  )
}
