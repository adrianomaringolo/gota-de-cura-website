'use client'

import { useState } from 'react'

const YOUTUBE_ID = '4g6LPXblvuE'

export function VisitVideo() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-darkest shadow-xl">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
          title="Vídeo promocional da visita à Chácara da Mãe Luzia"
          allow="accelerate-motion; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label="Assistir ao vídeo da visita"
        >
          <img
            src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
            alt="Prévia do vídeo promocional da visita à Chácara da Mãe Luzia"
            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-brand-darkest/30 transition-colors duration-300 group-hover:bg-brand-darkest/40" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-brand-darkest sm:h-8 sm:w-8" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
