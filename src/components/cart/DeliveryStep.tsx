'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Feedback'
import { Input } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { maskZipcode } from '@/lib/format'
import { SITE } from '@/lib/site'
import type { DeliveryInfo, ShippingAddress } from '@/lib/types'

type Method = DeliveryInfo['method']

type Props = {
  initial: DeliveryInfo | null
  onBack: () => void
  onSubmit: (delivery: DeliveryInfo) => void
}

type ViaCep = {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5a2.67 2.67 0 0 0 5.33 0 2.67 2.67 0 0 0 5.34 0A2.67 2.67 0 0 0 20 9.5" />
      <path d="M5 12.5V20h14v-7.5" />
      <path d="M10 20v-4.5h4V20" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6.5h11V17H3z" />
      <path d="M14 10h4l3 3.2V17h-7" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </svg>
  )
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  body,
}: {
  selected: boolean
  onSelect: () => void
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left',
        'transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lift',
        selected
          ? 'border-brand bg-brand-tint shadow-lift'
          : 'border-line bg-surface hover:border-brand/40 hover:bg-brand-tint/50',
      )}
    >
      <span
        className={cn(
          'grid h-14 w-14 place-items-center rounded-full transition-colors',
          selected ? 'bg-brand text-white' : 'bg-brand-soft/60 text-brand',
        )}
      >
        {icon}
      </span>
      <span>
        <span className="block font-display text-lg font-semibold text-ink">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{body}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-4 right-4 grid h-6 w-6 place-items-center rounded-full border-2 transition-colors',
          selected
            ? 'border-brand bg-brand text-white'
            : 'border-line-strong text-transparent',
        )}
      >
        <Check />
      </span>
    </button>
  )
}

const emptyAddress: ShippingAddress = {
  zipcode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
}

export function DeliveryStep({ initial, onBack, onSubmit }: Props) {
  const t = useTranslations('checkout')
  const [method, setMethod] = useState<Method>(initial?.method ?? 'pickup')
  const [lookup, setLookup] = useState<'idle' | 'loading' | 'notFound'>('idle')
  const lastLookup = useRef('')

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<ShippingAddress>({
    defaultValues: initial?.method === 'shipping' ? initial : emptyAddress,
  })

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
      const options = { shouldValidate: true }
      setValue('street', data.logradouro ?? '', options)
      setValue('neighborhood', data.bairro ?? '', options)
      setValue('city', data.localidade ?? '', options)
      setValue('state', data.uf ?? '', options)
      setLookup('idle')
      setFocus(data.logradouro ? 'number' : 'street')
    } catch {
      setLookup('notFound')
    }
  }

  const submit = handleSubmit((address) => {
    onSubmit({ method: 'shipping', ...address })
  })

  return (
    <form
      className="mt-10"
      noValidate
      onSubmit={(event) => {
        if (method === 'pickup') {
          event.preventDefault()
          onSubmit({ method: 'pickup' })
          return
        }
        void submit(event)
      }}
    >
      <h2 className="font-display text-2xl font-semibold text-ink">
        {t('deliveryTitle')}
      </h2>
      <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-ink-soft">
        {t('deliveryIntro')}
      </p>

      <div
        role="radiogroup"
        aria-label={t('deliveryTitle')}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <OptionCard
          selected={method === 'pickup'}
          onSelect={() => setMethod('pickup')}
          icon={<StoreIcon />}
          title={t('pickup')}
          body={t('pickupBody')}
        />
        <OptionCard
          selected={method === 'shipping'}
          onSelect={() => setMethod('shipping')}
          icon={<TruckIcon />}
          title={t('shippingOption')}
          body={t('shippingBody')}
        />
      </div>

      {method === 'pickup' ? (
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-brand/20 bg-brand-tint p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
          </span>
          <div className="text-sm">
            <p className="font-semibold text-ink">{t('pickupAt')}</p>
            <p className="mt-0.5 text-base text-ink">{SITE.store.address}</p>
            <a
              href={SITE.store.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
            >
              Google Maps
            </a>
          </div>
        </div>
      ) : (
        <fieldset className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <legend className="sr-only">{t('addressTitle')}</legend>
          <h3 className="font-display text-lg font-semibold text-ink">
            {t('addressTitle')}
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <Input
                label={t('zipcode')}
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="13024-000"
                hint={lookup === 'loading' ? t('zipcodeSearching') : t('zipcodeHint')}
                error={
                  errors.zipcode
                    ? t('zipcodeError')
                    : lookup === 'notFound'
                      ? t('zipcodeNotFound')
                      : undefined
                }
                {...register('zipcode', {
                  required: true,
                  pattern: /^\d{5}-?\d{3}$/,
                  onChange: (event) => {
                    const masked = maskZipcode(event.target.value)
                    setValue('zipcode', masked)
                    if (masked.replace(/\D/g, '').length < 8) {
                      lastLookup.current = ''
                      setLookup('idle')
                    }
                    void searchZipcode(masked)
                  },
                })}
              />
              {lookup === 'loading' && <Spinner className="mt-2 h-4 w-4 text-brand" />}
            </div>
            <Input
              label={t('street')}
              required
              autoComplete="address-line1"
              error={errors.street && t('streetError')}
              className="sm:col-span-4"
              {...register('street', { required: true })}
            />
            <Input
              label={t('number')}
              required
              inputMode="numeric"
              autoComplete="off"
              error={errors.number && t('numberError')}
              className="sm:col-span-2"
              {...register('number', { required: true })}
            />
            <Input
              label={t('complement')}
              autoComplete="address-line2"
              placeholder={t('complementPlaceholder')}
              className="sm:col-span-4"
              {...register('complement')}
            />
            <Input
              label={t('neighborhood')}
              required
              error={errors.neighborhood && t('neighborhoodError')}
              className="sm:col-span-2"
              {...register('neighborhood', { required: true })}
            />
            <Input
              label={t('city')}
              required
              autoComplete="address-level2"
              error={errors.city && t('cityError')}
              className="sm:col-span-3"
              {...register('city', { required: true })}
            />
            <Input
              label={t('state')}
              required
              autoComplete="address-level1"
              maxLength={2}
              placeholder="SP"
              error={errors.state && t('stateError')}
              className="sm:col-span-1"
              {...register('state', {
                required: true,
                minLength: 2,
                onChange: (event) =>
                  setValue(
                    'state',
                    event.target.value.toUpperCase().replace(/[^A-Z]/g, ''),
                  ),
              })}
            />
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          {t('backToDetails')}
        </Button>
        <Button type="submit" size="lg">
          {t('toReview')}
        </Button>
      </div>
    </form>
  )
}
