'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Container, SectionHead } from '@/components/site/Section'
import { useTestimonies } from '@/lib/hooks'
import { formatMonthAndYear } from '@/lib/format'
import { SITE } from '@/lib/site'

const ARROWS = [
  { label: 'Depoimentos anteriores', delta: -1, path: 'M15 6l-6 6 6 6' },
  { label: 'Próximos depoimentos', delta: 1, path: 'M9 6l6 6-6 6' },
] as const

export function Testimonies() {
  const { data, loading } = useTestimonies()
  const stripRef = useRef<HTMLDivElement>(null)
  // Both true means "nothing to scroll", so the arrows stay hidden until a
  // measurement proves the strip overflows.
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })

  const syncEdges = useCallback(() => {
    const strip = stripRef.current
    if (!strip) return

    const max = strip.scrollWidth - strip.clientWidth
    setEdges({ atStart: strip.scrollLeft <= 1, atEnd: strip.scrollLeft >= max - 1 })
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    syncEdges()
    strip.addEventListener('scroll', syncEdges, { passive: true })
    const observer = new ResizeObserver(syncEdges)
    observer.observe(strip)

    return () => {
      strip.removeEventListener('scroll', syncEdges)
      observer.disconnect()
    }
  }, [syncEdges, loading, data.length])

  const step = (direction: number) => {
    const strip = stripRef.current
    if (!strip) return

    // Measuring the offset between two cards keeps the step correct without
    // restating the gap here.
    const [first, second] = strip.children
    const distance =
      second instanceof HTMLElement && first instanceof HTMLElement
        ? second.offsetLeft - first.offsetLeft
        : strip.clientWidth

    strip.scrollBy({ left: distance * direction, behavior: 'smooth' })
  }

  if (!loading && data.length === 0) return null

  const scrollable = !loading && !(edges.atStart && edges.atEnd)

  return (
    <section id="depoimentos" className="scroll-mt-24 bg-canvas py-20 lg:py-24">
      <Container>
        <SectionHead
          title="Quem já esteve aqui"
          aside={
            <div className="flex items-center gap-5">
              <a
                href={SITE.testimonyForm}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
              >
                Deixar meu depoimento
              </a>
              {scrollable && (
                <div className="flex items-center gap-2">
                  {ARROWS.map((arrow) => (
                    <button
                      key={arrow.label}
                      type="button"
                      aria-label={arrow.label}
                      onClick={() => step(arrow.delta)}
                      disabled={arrow.delta < 0 ? edges.atStart : edges.atEnd}
                      className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-brand transition-colors duration-200 hover:bg-brand-tint disabled:pointer-events-none disabled:opacity-35"
                    >
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
                        <path d={arrow.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />
      </Container>

      {/* Held to the page grid so the first card lines up with the heading; the
          strip still runs past the last visible card, which is what makes it
          read as a strip rather than a row. */}
      <div
        ref={stripRef}
        role="group"
        aria-label="Depoimentos de quem já esteve na chácara"
        tabIndex={0}
        className="mt-10 snap-strip mx-auto max-w-[86rem] gap-4 px-4 pb-4 sm:px-6 lg:px-10"
      >
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
