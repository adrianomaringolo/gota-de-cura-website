import Image from 'next/image'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { VisitDates } from '@/components/visits/VisitDates'
import { VISIT_PRICES } from '@/lib/constants'
import { VISITS_OPEN } from '@/lib/site'

export function VisitBand() {
  return (
    <section id="visitacao" className="scroll-mt-24 bg-canvas-sunk py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Two plates, offset — a spread, not a card grid */}
          <div className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src="/images/visit/photo-06.jpg"
                alt="Grupo de visitantes sentado sob a varanda lilás da chácara acompanhando a destilação de uma planta aromática."
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="relative -mt-16 ml-auto hidden aspect-square w-2/5 overflow-hidden rounded-2xl border-4 border-canvas-sunk sm:block">
              <Image
                src="/images/visit/photo-01.jpg"
                alt="Placa de madeira pintada à mão com o nome Chácara da Mãe Luzia, cercada de flores de cerâmica."
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="rule-mark text-3xl font-semibold text-ink">
              Venha ver a planta antes de virar óleo
            </h2>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-ink-soft">
              Uma manhã na Chácara da Mãe Luzia, a 40 minutos de Campinas: café da manhã
              feito na casa, a destilação de uma planta aromática do começo ao fim e uma
              volta pela propriedade — horta, galinheiro e canteiros, sem agrotóxico e
              regados com água de nascente.
            </p>

            <dl className="mt-8 space-y-3 border-y border-line py-6 text-base">
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-28 shrink-0 text-ink-muted">Duração</dt>
                <dd className="font-medium text-ink">Das 8h às 12h, pontualmente</dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-28 shrink-0 text-ink-muted">Onde</dt>
                <dd className="font-medium text-ink">
                  Santo Antônio de Posse, perto de Holambra
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="w-28 shrink-0 text-ink-muted">Valor</dt>
                <dd className="font-medium text-ink">
                  {VISIT_PRICES.ADULT} por pessoa
                  <span className="block text-sm font-normal text-ink-soft">
                    {VISIT_PRICES.CHILD} de 8 a 14 anos · {VISIT_PRICES.FREE} até 7 anos
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-ink">
                Próximas datas
                <span className="ml-2 font-normal text-terra">vagas limitadas</span>
              </h3>
              <VisitDates className="mt-3" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {VISITS_OPEN && (
                <ButtonLink href="/visitas/inscricao" variant="accent" size="lg">
                  Garantir minha vaga
                </ButtonLink>
              )}
              <ButtonLink href="/visitas" variant="outline" size="lg">
                Ver como funciona
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
