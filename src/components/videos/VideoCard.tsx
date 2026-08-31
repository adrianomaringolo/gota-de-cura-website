'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatPostDate } from '@/lib/format'
import type { YoutubeVideo } from '@/lib/types'

const viewsFormatter = new Intl.NumberFormat('pt-BR')

/**
 * A lazy YouTube card: the thumbnail is a plain image until the visitor clicks,
 * then it swaps to the privacy-friendly embed. Same pattern as the visit video,
 * so no third-party script loads before intent.
 */
export function VideoCard({
  video,
  featured = false,
}: {
  video: YoutubeVideo
  featured?: boolean
}) {
  const [playing, setPlaying] = useState(false)

  const meta = [
    video.publishedAt && formatPostDate(video.publishedAt),
    video.views !== null && `${viewsFormatter.format(video.views)} visualizações`,
  ].filter(Boolean)

  return (
    <article className={cn('group flex flex-col', featured && 'sm:gap-1')}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-darkest shadow-lift">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerate-motion; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full"
            aria-label={`Assistir: ${video.title}`}
          >
            {/* YouTube's hqdefault is 4:3 with black bars baked in; a slight
                scale crops them out of the 16:9 frame. */}
            <img
              src={video.thumbnail}
              alt=""
              loading="lazy"
              className="h-full w-full scale-[1.08] object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.13]"
            />
            <span className="absolute inset-0 bg-brand-darkest/25 transition-colors duration-300 group-hover:bg-brand-darkest/35" />
            <span className="absolute inset-0 grid place-items-center">
              <span
                className={cn(
                  'grid place-items-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110',
                  featured ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-14 w-14',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    'ml-1 fill-brand-darkest',
                    featured ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6',
                  )}
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-4">
        <h2
          className={cn(
            'font-display font-semibold text-ink transition-colors group-hover:text-brand',
            featured ? 'text-xl leading-snug' : 'text-lg leading-snug',
          )}
        >
          <a href={video.url} target="_blank" rel="noreferrer">
            {video.title}
          </a>
        </h2>

        {meta.length > 0 && (
          <p className="mt-1.5 text-xs text-ink-muted">{meta.join(' · ')}</p>
        )}

        {featured && video.description && (
          <p className="mt-3 line-clamp-3 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            {video.description}
          </p>
        )}
      </div>
    </article>
  )
}
