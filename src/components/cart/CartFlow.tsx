'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import { Input, Textarea } from '@/components/ui/Field'
import { useCart } from '@/lib/cart-context'
import { formatCurrency, maskPhone, maskZipcode } from '@/lib/format'
import { SITE } from '@/lib/site'
import type { ContactInfo, Coupon } from '@/lib/types'
import { couponDiscount, OrdersService } from '@/services/orders'
import { CartLines } from './CartLines'
import { CouponBox } from './CouponBox'
import { Stepper } from './Stepper'

type Step = 'items' | 'contact' | 'review' | 'saving' | 'done'

const stepIndex: Record<Step, number> = {
  items: 0,
  contact: 1,
  review: 2,
  saving: 2,
  done: 2,
}

export function CartFlow() {
  const { items, total, count, ready, clear } = useCart()
  const [step, setStep] = useState<Step>('items')
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [coupon, setCoupon] = useState<Coupon | undefined>()
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ContactInfo>({ defaultValues: contact ?? undefined })

  const discount = couponDiscount(total, coupon)
  const payable = Math.max(0, total - discount)

  const submitOrder = async () => {
    if (!contact) return
    setStep('saving')
    try {
      const number = await OrdersService.saveOrder(
        { items: items.filter((item) => item.amount > 0) },
        contact,
        coupon,
      )
      setOrderNumber(number)
      clear()
      setStep('done')
    } catch (error) {
      console.error(error)
      toast.error('Não conseguimos enviar seu pedido. Tente novamente em instantes.')
      setStep('review')
    }
  }

  if (!ready) {
    return (
      <Container className="grid min-h-[60vh] place-items-center pt-32 pb-20">
        <Spinner className="text-brand" />
      </Container>
    )
  }

  if (step === 'done') {
    return (
      <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center sm:p-12">
          <p className="font-display text-2xl font-semibold text-ink">
            Pedido enviado
            {orderNumber !== null && <span className="text-brand"> #{orderNumber}</span>}
          </p>
          <p className="mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-ink-soft">
            A equipe {SITE.name} vai entrar em contato pelo WhatsApp para confirmar os
            produtos, combinar a entrega e o pagamento. Obrigado por sustentar esse
            trabalho com a gente.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/#catalogo">Voltar ao catálogo</ButtonLink>
            <a
              href={SITE.testimonyForm}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-full border border-brand/35 px-6 text-sm font-medium text-brand transition-colors hover:border-brand hover:bg-brand-tint"
            >
              Deixar um depoimento
            </a>
          </div>
        </div>
      </Container>
    )
  }

  if (count === 0) {
    return (
      <Container className="max-w-2xl pt-32 pb-24 lg:pt-40">
        <h1 className="mb-8 text-3xl font-semibold text-ink">Meu pedido</h1>
        <EmptyState
          title="Seu pedido ainda está vazio"
          action={<ButtonLink href="/#catalogo">Ver o catálogo</ButtonLink>}
        >
          Escolha os produtos nas prateleiras e eles aparecem aqui para você revisar antes
          de enviar.
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container className="max-w-4xl pt-32 pb-24 lg:pt-40">
      <h1 className="text-3xl font-semibold text-ink">Meu pedido</h1>
      <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-ink-soft">
        Este é um pedido de reserva. Depois de enviá-lo, nossa equipe confirma a
        disponibilidade de cada item e combina o pagamento e a entrega com você.
      </p>

      <div className="mt-8 border-y border-line py-4">
        <Stepper current={stepIndex[step]} />
      </div>

      {step === 'items' && (
        <section className="mt-10">
          <CartLines />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/#catalogo"
              className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
            >
              Continuar escolhendo
            </Link>
            <p className="font-display text-2xl font-semibold text-ink tabular-nums">
              Total {formatCurrency(total)}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                clear()
                toast.success('Pedido esvaziado')
              }}
            >
              Esvaziar
            </Button>
            <Button size="lg" onClick={() => setStep('contact')}>
              Preencher meus dados
            </Button>
          </div>
        </section>
      )}

      {step === 'contact' && (
        <form
          className="mt-10"
          onSubmit={handleSubmit((data) => {
            setContact(data)
            setStep('review')
          })}
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Nome completo"
              required
              autoComplete="name"
              error={errors.name && 'Precisamos do seu nome completo.'}
              className="sm:col-span-2"
              {...register('name', { required: true, minLength: 3 })}
            />
            <Input
              label="Celular (WhatsApp)"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="(19) 99999-9999"
              hint="É por aqui que a equipe fala com você."
              error={errors.phone && 'Informe um celular com DDD.'}
              {...register('phone', {
                required: true,
                pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                onChange: (event) => setValue('phone', maskPhone(event.target.value)),
              })}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              error={errors.email && 'Confira o e-mail digitado.'}
              {...register('email', { pattern: /^\S+@\S+\.\S+$/ })}
            />
            <Input
              label="Cidade"
              required
              autoComplete="address-level2"
              error={errors.city && 'Informe sua cidade.'}
              {...register('city', { required: true })}
            />
            <Input
              label="CEP"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="13024-000"
              error={errors.zipcode && 'Informe um CEP válido.'}
              {...register('zipcode', {
                required: true,
                pattern: /^\d{5}-?\d{3}$/,
                onChange: (event) => setValue('zipcode', maskZipcode(event.target.value)),
              })}
            />
            <Textarea
              label="Observações"
              rows={4}
              className="sm:col-span-2"
              placeholder="Algum recado sobre o pedido, entrega ou embalagem?"
              {...register('observations')}
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep('items')}>
              Voltar aos produtos
            </Button>
            <Button type="submit" size="lg">
              Revisar pedido
            </Button>
          </div>
        </form>
      )}

      {(step === 'review' || step === 'saving') && contact && (
        <section className="mt-10 space-y-8">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">Seus dados</h2>
              <button
                type="button"
                onClick={() => setStep('contact')}
                className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
              >
                Corrigir
              </button>
            </div>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-base sm:grid-cols-2">
              {[
                ['Nome', contact.name],
                ['Celular', contact.phone],
                ['E-mail', contact.email || '—'],
                ['Cidade', contact.city],
                ['CEP', contact.zipcode],
                ['Observações', contact.observations || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="shrink-0 text-ink-muted">{label}:</dt>
                  <dd className="min-w-0 break-words text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Produtos</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {items
                .filter((item) => item.amount > 0)
                .map((item) => (
                  <li key={item.id} className="flex items-baseline gap-4 py-3">
                    <span className="w-10 shrink-0 text-right font-semibold text-ink tabular-nums">
                      {item.amount}×
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink">{item.name}</span>
                      <span className="block text-sm text-ink-muted">{item.type}</span>
                    </span>
                    <span className="shrink-0 font-medium text-ink tabular-nums">
                      {formatCurrency(item.price * item.amount)}
                    </span>
                  </li>
                ))}
            </ul>

            <div className="mt-6">
              <CouponBox applied={coupon} onApply={setCoupon} />
            </div>

            <dl className="mt-6 space-y-2 border-t border-line pt-4 text-base">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="text-ink tabular-nums">{formatCurrency(total)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-positive">
                  <dt>
                    Desconto
                    {coupon?.discountType === 'percentage' && ` (${coupon.discount}%)`}
                  </dt>
                  <dd className="tabular-nums">− {formatCurrency(discount)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-display text-lg font-semibold text-ink">Total</dt>
                <dd className="font-display text-2xl font-semibold text-ink tabular-nums">
                  {formatCurrency(payable)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-ink-muted">
              O frete, quando houver, é combinado à parte com a equipe.
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('contact')}
              disabled={step === 'saving'}
            >
              Voltar
            </Button>
            <Button size="lg" onClick={submitOrder} disabled={step === 'saving'}>
              {step === 'saving' ? (
                <>
                  <Spinner className="h-4 w-4" /> Enviando…
                </>
              ) : (
                'Confirmar pedido'
              )}
            </Button>
          </div>
        </section>
      )}
    </Container>
  )
}
