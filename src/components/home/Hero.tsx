import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'
import { Wordmark } from '@/components/site/Wordmark'
import { SITE } from '@/lib/site'

export function Hero() {
  return (
    <section className="relative bg-brand-darkest text-white">
      <div className="grid lg:min-h-[calc(100svh-0px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Panel ------------------------------------------------------- */}
        <div className="relative z-[var(--z-raised)] flex flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-14 lg:py-32 xl:pl-[max(2.5rem,calc((100vw-86rem)/2+2.5rem))]">
          <div className="animate-rise [animation-delay:60ms]">
            <Wordmark tone="light" size="md" />
          </div>

          <h1 className="animate-rise mt-10 max-w-[14ch] text-5xl font-semibold [animation-delay:140ms]">
            Passe na loja e sinta o aroma.
          </h1>

          <p className="animate-rise mt-6 max-w-[52ch] text-lg leading-relaxed text-white/75 [animation-delay:220ms]">
            Nossa loja fica em Campinas, na José Paulino. Ali você abre os frascos, sente
            cada aroma com calma e conversa com quem destilou — todo o catálogo do site
            está na prateleira.
          </p>

          {/* The store's two facts that decide a visit: where and when. */}
          {/* Stacks on small screens so both rows break the same way. */}
          <dl className="animate-rise mt-9 space-y-3 border-y border-white/15 py-6 text-base [animation-delay:300ms]">
            <div className="grid gap-x-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
              <dt className="text-white/60">Endereço</dt>
              <dd className="font-medium text-white">{SITE.store.address}</dd>
            </div>
            <div className="grid gap-x-3 sm:grid-cols-[5rem_minmax(0,1fr)]">
              <dt className="text-white/60">Horário</dt>
              <dd className="font-medium text-white">
                {SITE.store.hours.map(([day, hours]) => (
                  <span key={day} className="block">
                    {day}, {hours}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:380ms]">
            <ButtonLink href="#catalogo" variant="onDark" size="lg">
              Ver o catálogo
            </ButtonLink>
            <a
              href={SITE.store.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-medium text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/10"
            >
              Como chegar
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </a>
          </div>
        </div>

        {/* Plate ------------------------------------------------------- */}
        <figure className="relative m-0 min-h-[62svh] lg:min-h-0">
          <Image
            src="/images/store.jpeg"
            alt="O interior da loja da Gota de Cura: prateleiras de madeira com sprays, óleos essenciais e sabonetes, o quadro da marca na parede e a luz entrando pela janela."
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-veil/88 via-veil/15 to-transparent lg:bg-linear-[100deg,var(--color-brand-darkest)_0%,var(--color-veil)_30%,transparent_72%]"
          />
          {/* The shop is shot in bright daylight; the caption needs its own floor. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-veil/95 via-veil/45 to-transparent"
          />

          <figcaption className="absolute right-4 bottom-6 left-4 text-sm leading-relaxed text-white/85 sm:right-8 sm:left-auto sm:max-w-[28ch] sm:text-right lg:bottom-10">
            <span className="font-display text-base font-semibold text-white">
              Nossa loja, na José Paulino
            </span>
            <br />
            Tudo o que sai da chácara chega aqui — e dá para sentir o aroma antes de
            levar.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
