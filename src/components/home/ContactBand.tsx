import Image from 'next/image'
import { Container } from '@/components/site/Section'
import { SocialLinks } from '@/components/site/SocialLinks'
import { SITE } from '@/lib/site'

export function ContactBand() {
  return (
    <section id="contato" className="scroll-mt-24 bg-canvas py-20 lg:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="rule-mark text-3xl font-semibold text-ink">Onde nos achar</h2>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-ink-muted">Loja física</h3>
                <address className="mt-2 font-display text-xl text-ink not-italic">
                  {SITE.store.address}
                </address>
                <dl className="mt-4 max-w-sm space-y-1.5 text-base">
                  {SITE.store.hours.map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-baseline justify-between gap-4 border-b border-line pb-1.5"
                    >
                      <dt className="text-ink-soft">{day}</dt>
                      <dd className="font-medium text-ink tabular-nums">{hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink-muted">
                  Acompanhe o dia a dia
                </h3>
                <SocialLinks className="mt-3" showHandles />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl bg-brand-tint p-7 sm:flex-row sm:items-center lg:p-9">
            <a
              href={SITE.aromatherapist.link}
              target="_blank"
              rel="noreferrer"
              className="relative block aspect-square w-32 shrink-0 overflow-hidden rounded-xl sm:w-40"
            >
              <Image
                src={SITE.aromatherapist.seal}
                alt={`Certificação CertAroma de ${SITE.aromatherapist.name}`}
                fill
                sizes="160px"
                className="object-cover"
              />
            </a>
            <div>
              <h3 className="text-sm font-semibold text-brand">
                Aromaterapeuta responsável
              </h3>
              <p className="mt-1 font-display text-2xl text-ink">
                {SITE.aromatherapist.name}
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                {SITE.aromatherapist.credential}. Responsável técnico pelas fórmulas e
                pela destilação de tudo o que sai da chácara.
              </p>
              <a
                href={SITE.aromatherapist.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
              >
                Ver a certificação
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
