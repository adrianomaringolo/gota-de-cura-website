import type { Metadata } from 'next'
import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { PaymentTerms } from '@/components/visits/PaymentTerms'
import { PhotoGallery } from '@/components/visits/PhotoGallery'
import { VisitDates } from '@/components/visits/VisitDates'
import { VisitVideo } from '@/components/visits/VisitVideo'
import { VISIT_PRICES } from '@/lib/constants'
import { SITE, VISITS_OPEN } from '@/lib/site'
import { visitProgram, visitTestimonies } from '@/lib/visit-content'

export const metadata: Metadata = {
  title: 'Visita guiada à Chácara da Mãe Luzia',
  description:
    'Uma manhã na chácara onde as plantas da Gota de Cura são cultivadas e destiladas: café da manhã, destilação ao vivo e visita guiada pela propriedade.',
  alternates: { canonical: '/visitas' },
  openGraph: {
    title: 'Visita guiada à Chácara da Mãe Luzia',
    description:
      'Café da manhã, destilação ao vivo e visita guiada pela chácara onde plantamos e destilamos tudo.',
    url: '/visitas',
    images: [{ url: '/images/visit/photo-10.jpg', width: 1200, height: 630 }],
  },
}

export default function VisitasPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-brand-darkest text-white">
        <Image
          src="/images/visit/photo-10.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-22"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-brand-darkest via-brand-darkest/88 to-brand-darkest/45"
        />

        <Container className="relative pt-32 pb-16 lg:pt-44 lg:pb-24">
          <h1 className="max-w-[16ch] text-4xl font-semibold">
            Uma manhã na Chácara da Mãe Luzia
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-white/80">
            É aqui que plantamos, colhemos e destilamos tudo o que vira óleo essencial e
            hidrolato. A visita é aberta a quem quiser ver o processo inteiro de perto —
            aromaterapeutas ou não.
          </p>

          <div className="mt-10">
            <h2 className="text-sm font-semibold text-white/70">Próximas datas</h2>
            <VisitDates tone="light" className="mt-3" />
          </div>

          {VISITS_OPEN && (
            <ButtonLink
              href="/visitas/inscricao"
              variant="onDark"
              size="lg"
              className="mt-8"
            >
              Garantir minha vaga
            </ButtonLink>
          )}
        </Container>
      </header>

      <section className="bg-canvas py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="rule-mark mx-auto text-3xl font-semibold text-ink">
              Veja como é a visita
            </h2>
            <p className="mx-auto mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft">
              Um vídeo curto para você conhecer a chácara antes de vir pessoalmente.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl">
            <VisitVideo />
          </div>
        </Container>
      </section>

      <section className="bg-canvas-sunk py-20 lg:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <h2 className="rule-mark text-3xl font-semibold text-ink">Como é o dia</h2>
              <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft">
                A propriedade é da {SITE.morada.name}, instituição fundada em Campinas em
                1980. Fica em Santo Antônio de Posse, perto de Holambra, a cerca de 40
                minutos de Campinas. Tudo o que se produz ali existe para sustentar os
                trabalhos assistenciais da Morada.
              </p>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft">
                São quatro horas de programação, das 8h às 12h, sem pressa.
              </p>
            </div>

            <ol className="space-y-px">
              {visitProgram.map((entry) => (
                <li
                  key={entry.time}
                  className="grid gap-x-6 gap-y-1 border-t border-line py-6 last:border-b sm:grid-cols-[5rem_1fr]"
                >
                  <span className="font-display text-xl font-semibold text-terra tabular-nums">
                    {entry.time}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {entry.title}
                    </h3>
                    <p className="mt-1.5 max-w-[54ch] text-base leading-relaxed text-ink-soft">
                      {entry.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="bg-canvas py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <h2 className="rule-mark text-3xl font-semibold text-ink">
                Valores e combinados
              </h2>
              <dl className="mt-6 space-y-2 text-base">
                {[
                  ['Acima de 15 anos', VISIT_PRICES.ADULT],
                  ['De 8 a 14 anos', VISIT_PRICES.CHILD],
                  ['Até 7 anos', VISIT_PRICES.FREE],
                ].map(([label, price]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-2"
                  >
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="font-display text-lg font-semibold text-ink tabular-nums">
                      {price}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-base font-medium text-terra">
                As vagas são limitadas — cada grupo é pequeno de propósito.
              </p>
            </div>

            <PaymentTerms />
          </div>
        </Container>
      </section>

      <section className="bg-canvas-sunk py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="rule-mark text-3xl font-semibold text-ink">
              A chácara por dentro
            </h2>
            <a
              href={SITE.photoAlbum}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
            >
              Ver o álbum completo
            </a>
          </div>
          <div className="mt-10">
            <PhotoGallery />
          </div>
        </Container>
      </section>

      <section className="bg-brand-deep py-20 text-white lg:py-24">
        <Container>
          <h2 className="rule-mark text-3xl font-semibold">O que dizem quem já veio</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {visitTestimonies.map((testimony) => (
              <figure key={testimony.name} className="flex flex-col">
                <blockquote className="flex-1 text-base leading-relaxed text-white/80">
                  {testimony.text}
                </blockquote>
                <figcaption className="mt-5 border-t border-white/15 pt-4">
                  <span className="block font-display text-lg text-white">
                    {testimony.name}
                  </span>
                  <span className="text-sm text-white/75">{testimony.date}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {VISITS_OPEN && (
            <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/15 pt-10">
              <p className="flex-1 font-display text-2xl text-white">
                Quer conhecer de perto?
              </p>
              <ButtonLink href="/visitas/inscricao" variant="onDark" size="lg">
                Fazer minha inscrição
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
