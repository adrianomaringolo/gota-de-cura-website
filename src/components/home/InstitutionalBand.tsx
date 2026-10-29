'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Container, SectionHead } from '@/components/site/Section'

const VIDEO_ID = '5y_8xHLaKUc'

/**
 * The institutional video. The thumbnail is a plain image until the visitor
 * clicks, then it swaps to the privacy-friendly embed — same lazy pattern as
 * `VideoCard`, so no third-party script loads before intent.
 */
export function InstitutionalBand() {
  const t = useTranslations('institutionalBand')
  const [playing, setPlaying] = useState(false)

  return (
    <section className="bg-canvas py-20 lg:py-24">
      <Container>
        <SectionHead title={t('title')} lead={t('lead')} />

        <div className="relative mx-auto mt-10 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-brand-darkest shadow-lift">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={t('videoTitle')}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 h-full w-full"
              aria-label={t('watch')}
            >
              <img
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-brand-darkest/25 transition-colors duration-300 group-hover:bg-brand-darkest/35" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-1 h-7 w-7 fill-brand-darkest sm:h-8 sm:w-8"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </Container>
    </section>
  )
}
