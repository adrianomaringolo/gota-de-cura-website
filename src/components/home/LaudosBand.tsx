'use client'

import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { useCromatografias } from '@/lib/hooks'
import { CROMATOGRAFIA_LABELS } from '@/lib/constants'

export function LaudosBand() {
  const { data, loading } = useCromatografias()
  const preview = data.slice(0, 6)

  return (
    <section className="bg-brand-deep py-20 text-white lg:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="max-w-[46ch]">
            <h2 className="rule-mark text-3xl font-semibold">
              O que tem dentro do vidro, por escrito
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Cromatografia é o exame que separa e identifica cada componente de uma
              mistura. Mandamos nossos óleos essenciais e hidrolatos para o laboratório e
              publicamos o laudo inteiro — não um resumo.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              É a forma mais simples de você conferir, sem depender da nossa palavra, o
              que saiu do alambique.
            </p>

            <ButtonLink href="/cromatografias" variant="onDark" className="mt-8">
              Ver todos os laudos
            </ButtonLink>
          </div>

          <div>
            {loading ? (
              <ul className="space-y-px" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <li
                    key={index}
                    className="h-16 animate-pulse rounded-lg bg-white/8"
                    style={{ animationDelay: `${index * 80}ms` }}
                  />
                ))}
              </ul>
            ) : preview.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/25 px-6 py-10 text-center text-white/60">
                Os laudos estão sendo preparados e aparecem aqui assim que saem do
                laboratório.
              </p>
            ) : (
              <ul className="divide-y divide-white/12 border-y border-white/12">
                {preview.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-baseline gap-4 py-4 transition-colors hover:bg-white/5"
                    >
                      <span className="flex-1">
                        <span className="font-display text-lg text-white">
                          {item.name}
                        </span>
                        <span className="ml-2 text-sm text-white/55 italic">
                          {item.scientificName}
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-2xs font-semibold tracking-[0.1em] text-white/65 uppercase sm:block">
                        {CROMATOGRAFIA_LABELS[item.type] ?? item.type}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0 text-white/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {data.length > preview.length && (
              <p className="mt-4 text-sm text-white/55">
                e mais {data.length - preview.length}{' '}
                {data.length - preview.length === 1 ? 'laudo' : 'laudos'} —{' '}
                <Link
                  href="/cromatografias"
                  className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  ver a lista completa
                </Link>
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
