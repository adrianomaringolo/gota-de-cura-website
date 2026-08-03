import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'
import { Wordmark } from '@/components/site/Wordmark'

const facts = [
  'Destilação própria',
  'Laudos de cromatografia',
  'Renda revertida à Morada',
]

export function Hero() {
  return (
    <section className="relative bg-brand-darkest text-white">
      <div className="grid lg:min-h-[calc(100svh-0px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Panel ------------------------------------------------------- */}
        <div className="relative z-[var(--z-raised)] flex flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-14 lg:py-32 xl:pl-[max(2.5rem,calc((100vw-86rem)/2+2.5rem))]">
          <div className="animate-rise [animation-delay:60ms]">
            <Wordmark tone="light" size="md" withTagline />
          </div>

          <h1 className="animate-rise mt-10 max-w-[15ch] text-5xl font-semibold [animation-delay:140ms]">
            Cada gota começa num canteiro daqui.
          </h1>

          <p className="animate-rise mt-6 max-w-[52ch] text-lg leading-relaxed text-white/75 [animation-delay:220ms]">
            Óleos essenciais, hidrolatos e sabonetes destilados e feitos à mão na Chácara
            da Mãe Luzia, em Santo Antônio de Posse. Você pode ver a planta, o alambique e
            o laudo de cada lote.
          </p>

          <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:300ms]">
            <ButtonLink href="#catalogo" variant="onDark" size="lg">
              Ver o catálogo
            </ButtonLink>
            <ButtonLink
              href="/visitas"
              size="lg"
              className="border border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
            >
              Visitar a chácara
            </ButtonLink>
          </div>

          <ul className="animate-rise mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70 [animation-delay:380ms]">
            {facts.map((fact, index) => (
              <li key={fact} className="flex items-center gap-3">
                {index > 0 && (
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
                )}
                {fact}
              </li>
            ))}
          </ul>
        </div>

        {/* Plate ------------------------------------------------------- */}
        <figure className="relative m-0 min-h-[62svh] lg:min-h-0">
          <Image
            src="/images/visit/photo-03.jpg"
            alt="O alambique de cobre e aço da chácara, montado sob a varanda de parede lilás, com a horta e as colinas ao fundo."
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-veil/88 via-veil/15 to-transparent lg:bg-linear-[100deg,var(--color-brand-darkest)_0%,var(--color-veil)_30%,transparent_72%]"
          />
          {/* The still is shot in full sun; the caption needs its own floor. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-veil/92 to-transparent"
          />

          <figcaption className="absolute right-4 bottom-6 left-4 text-sm leading-relaxed text-white/85 sm:right-8 sm:left-auto sm:max-w-[28ch] sm:text-right lg:bottom-10">
            <span className="font-display text-base font-semibold text-white">
              O alambique
            </span>
            <br />É aqui que a planta colhida pela manhã vira óleo essencial e hidrolato.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
