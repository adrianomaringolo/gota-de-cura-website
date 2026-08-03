import { Container, SectionHead } from '@/components/site/Section'
import { SITE } from '@/lib/site'

/**
 * Four reasons to buy here, stated plainly. This sits high on the page as the
 * scannable version; the ImpactBand further down tells the same story at length.
 */
const items = [
  {
    title: 'Sem fins lucrativos',
    text: `Não há dono nem sócio para remunerar. Cada real da venda vai para os trabalhos assistenciais da ${SITE.morada.name}.`,
    // Heart
    path: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  },
  {
    title: 'Trabalho voluntário',
    text: 'Quem planta, colhe, destila, embala e atende é voluntário. Ninguém aqui tira salário do que você compra.',
    // Two figures
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    title: 'Cuidado em todas as etapas',
    text: 'Do plantio ao envase, tudo acontece na Chácara da Mãe Luzia. Sem terceirizar nenhuma etapa e sem intermediário entre o canteiro e o frasco.',
    // Sprout
    path: 'M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8ZM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z',
  },
  {
    title: 'Atendimento humanizado',
    text: 'Você conversa com quem destilou. Dúvida sobre diluição, uso ou contraindicação tem resposta de gente que conhece o produto.',
    // Speech bubble
    path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z',
  },
]

export function DifferentialsBand() {
  return (
    <section className="bg-canvas-sunk py-20 lg:py-24">
      <Container>
        <SectionHead
          title="Nossos diferenciais"
          lead="A Gota de Cura não é uma marca com causa social anexada. A causa é o motivo de ela existir."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex flex-col rounded-2xl border border-line bg-surface p-6"
            >
              <span
                aria-hidden="true"
                className="grid h-12 w-12 place-items-center rounded-full bg-brand-tint text-brand"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.path} />
                </svg>
              </span>

              <h3 className="mt-5 font-display text-lg leading-snug font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
