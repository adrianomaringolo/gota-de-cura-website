import type { Metadata } from 'next'
import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { PageHeader } from '@/components/site/PageHeader'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Sobre nós',
  description:
    'A Gota de Cura nasceu em 2017, dos primeiros sabonetes artesanais. Hoje é uma equipe de voluntários que planta, destila e embala tudo na Chácara da Mãe Luzia.',
}

const values = [
  {
    title: 'Responsabilidade social',
    text: 'Toda a renda da comercialização vai para os trabalhos assistenciais da Morada Espírita Prof. Lairi Hans, em Campinas.',
  },
  {
    title: 'Sustentabilidade',
    text: 'Ingredientes naturais, água de nascente, adubação natural e energia limpa. Sem agrotóxico em nenhum canteiro.',
  },
  {
    title: 'Qualidade',
    text: 'Pureza e eficácia terapêutica comprovadas por laudo, não por promessa.',
  },
  {
    title: 'Transparência',
    text: 'Informação clara sobre o que tem em cada produto e como ele foi feito.',
  },
  {
    title: 'Inovação',
    text: 'Novas receitas e processos, sempre testados antes de virarem catálogo.',
  },
]

export default function SobrePage() {
  return (
    <>
      <PageHeader
        title="Começou com um sabonete"
        lead="A marca Gota de Cura nasceu em 2017, da iniciativa do nosso aromaterapeuta Marcelo Mattar. Hoje é uma equipe grande de voluntários — e um catálogo que não para de crescer."
      />

      <article className="bg-canvas py-20 lg:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div className="max-w-[68ch] space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                Tudo começou com os primeiros sabonetes artesanais feitos com óleos
                vegetais nobres, predominando o azeite de oliva extra virgem, enriquecidos
                com óleos essenciais de alecrim e lavanda. Desde o início eles já tinham
                um diferencial: no lugar da água, hidrolato orgânico de melaleuca.
              </p>
              <p>
                Vieram novas receitas, novos aromas terapêuticos, sempre com óleos
                essenciais de qualidade. Com o tempo, o Marcelo começou a destilar ele
                mesmo, de forma artesanal, as plantas aromáticas para obter os próprios
                óleos essenciais e hidrolatos.
              </p>
              <p>
                Depois dos sabonetes vieram os sprays energéticos, os sais de banho, os
                hidrolatos, os óleos essenciais, as tinturas, as pomadas. Nunca perdemos o
                propósito: levar as propriedades terapêuticas e vibracionais das plantas
                através dos nossos produtos, com toda a renda revertida aos trabalhos
                assistenciais da {SITE.morada.name}.
              </p>
            </div>

            <div className="space-y-8">
              <figure className="m-0">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                  <Image
                    src="/images/visit/photo-05.jpg"
                    alt="Canteiros de hortaliças plantados na terra vermelha da chácara, com palmeiras ao fundo."
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-ink-muted">
                  Os canteiros da Chácara da Mãe Luzia, em Santo Antônio de Posse.
                </figcaption>
              </figure>

              <div className="rounded-2xl bg-brand-tint p-6">
                <h2 className="font-display text-xl font-semibold text-brand">Missão</h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  Proporcionar bem-estar e qualidade de vida através de produtos para
                  aromaterapia, promovendo o equilíbrio físico, mental, emocional e
                  espiritual.
                </p>

                <h2 className="mt-6 font-display text-xl font-semibold text-brand">
                  Visão
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  Ser referência em produtos para aromaterapia pela qualidade terapêutica
                  e vibracional, com práticas voltadas à sustentabilidade e ao respeito à
                  natureza e ao próximo.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </article>

      <section className="bg-canvas-sunk py-20 lg:py-24">
        <Container>
          <h2 className="rule-mark text-3xl font-semibold text-ink">Nossos valores</h2>

          <dl className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="border-t border-line-strong py-6">
                <dt className="font-display text-xl font-semibold text-ink">
                  {value.title}
                </dt>
                <dd className="mt-2 max-w-[46ch] text-base leading-relaxed text-ink-soft">
                  {value.text}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-canvas py-16 lg:py-20">
        <Container className="flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-[40ch] font-display text-2xl text-ink">
            Quer ver de perto como cada gota é feita?
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/visitas" size="lg">
              Conhecer a chácara
            </ButtonLink>
            <ButtonLink href="/cromatografias" variant="outline" size="lg">
              Ver os laudos
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
