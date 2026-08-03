'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { visitPhotos } from '@/lib/visit-content'

export function PhotoGallery() {
  const [index, setIndex] = useState<number | null>(null)
  const open = index !== null

  const move = useCallback((delta: number) => {
    setIndex((current) =>
      current === null
        ? null
        : (current + delta + visitPhotos.length) % visitPhotos.length,
    )
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIndex(null)
      if (event.key === 'ArrowRight') move(1)
      if (event.key === 'ArrowLeft') move(-1)
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, move])

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visitPhotos.map((photo, position) => (
          <li key={photo.src}>
            <button
              type="button"
              onClick={() => setIndex(position)}
              className="group relative block aspect-4/3 w-full overflow-hidden rounded-xl bg-canvas-sunk"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-brand-darkest/0 transition-colors duration-300 group-hover:bg-brand-darkest/25" />
            </button>
          </li>
        ))}
      </ul>

      {open && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={visitPhotos[index].alt}
          className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-veil/97 animate-[fade-in_0.2s_ease-out]"
          onClick={() => setIndex(null)}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Fechar galeria"
              autoFocus
              className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <figure
            className="relative m-0 flex min-h-0 flex-1 flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative min-h-0 flex-1">
              <Image
                src={visitPhotos[index].src}
                alt={visitPhotos[index].alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="px-6 py-5 text-center text-sm text-white/70">
              {visitPhotos[index].alt}
              <span className="mt-1 block text-white/45 tabular-nums">
                {index + 1} de {visitPhotos.length}
              </span>
            </figcaption>
          </figure>

          {[
            { label: 'Foto anterior', delta: -1, side: 'left-3', path: 'M15 6l-6 6 6 6' },
            { label: 'Próxima foto', delta: 1, side: 'right-3', path: 'M9 6l6 6-6 6' },
          ].map((control) => (
            <button
              key={control.label}
              type="button"
              aria-label={control.label}
              onClick={(event) => {
                event.stopPropagation()
                move(control.delta)
              }}
              className={`absolute top-1/2 ${control.side} grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:h-14 sm:w-14`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={control.path} />
              </svg>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
