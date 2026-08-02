'use client'

import { Container, SectionHead } from '@/components/site/Section'
import { useTestimonies } from '@/lib/hooks'
import { formatMonthAndYear } from '@/lib/format'
import { SITE } from '@/lib/site'

export function Testimonies() {
  const { data, loading } = useTestimonies()

  if (!loading && data.length === 0) return null

  return (
    <section id="depoimentos" className="scroll-mt-24 bg-canvas py-20 lg:py-24">
      <Container>
        <SectionHead
          title="Quem já esteve aqui"
          aside={
            <a
              href={SITE.testimonyForm}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
            >
              Deixar meu depoimento
            </a>
          }
        />
      </Container>

      {/* Bleeds past the container on purpose: the strip should feel longer
          than the page is wide. */}
      <div className="mt-10 snap-strip gap-4 px-4 pb-4 sm:px-6 lg:px-10">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-56 w-[min(28rem,84vw)] animate-pulse rounded-2xl bg-canvas-sunk"
                style={{ animationDelay: `${index * 90}ms` }}
              />
            ))
          : data.slice(0, 12).map((testimony, index) => (
              <figure
                key={`${testimony.name}-${index}`}
                className="flex w-[min(28rem,84vw)] flex-col rounded-2xl border border-line bg-surface p-7"
              >
                <blockquote className="flex-1 text-base leading-relaxed text-ink-soft">
                  <p className="line-clamp-[9]">{testimony.message}</p>
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block font-display text-lg text-ink">
                    {testimony.name}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {testimony.city && <>{testimony.city} · </>}
                    {formatMonthAndYear(new Date(testimony.sentAt))}
                  </span>
                </figcaption>
              </figure>
            ))}
      </div>
    </section>
  )
}
