'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Feedback'
import { cn } from '@/lib/cn'
import { ProductsService } from '@/services/products'

/**
 * The product's photos, in the order the product page's gallery shows them —
 * main one first. Reorder by dragging (pointer) or with the arrow buttons
 * (touch and keyboard). Removing a photo only detaches it from
 * the product: the file stays in Storage, so cancelling the form never leaves a
 * saved product pointing at a deleted image.
 */
export function ProductImagesField({
  value,
  onChange,
  error,
}: {
  value: string[]
  onChange: (images: string[]) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  const upload = async (files: FileList | null) => {
    const selected = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'))
    if (selected.length === 0) return

    setUploading(selected.length)
    const results = await Promise.allSettled(
      selected.map((file) => ProductsService.uploadProductImage(file)),
    )
    setUploading(0)

    const uploaded = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    )
    const failed = results.filter((result) => result.status === 'rejected')
    failed.forEach((result) =>
      console.error('[ProductImagesField] Falha no upload', (result as PromiseRejectedResult).reason),
    )

    if (uploaded.length) onChange([...value, ...uploaded])
    if (failed.length) {
      toast.error(
        failed.length === 1
          ? 'Uma imagem não pôde ser enviada'
          : `${failed.length} imagens não puderam ser enviadas`,
      )
    }
  }

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return
    const next = [...value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  const endDrag = () => {
    setDragging(null)
    setDropTarget(null)
  }

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((src, index) => (
          <figure
            key={src}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              setDragging(index)
            }}
            onDragOver={(event) => {
              if (dragging === null) return
              event.preventDefault()
              setDropTarget(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              if (dragging !== null) move(dragging, index)
              endDrag()
            }}
            onDragEnd={endDrag}
            className={cn(
              'group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-canvas-sunk active:cursor-grabbing',
              index === 0 ? 'border-brand ring-2 ring-brand/30' : 'border-line',
              dragging === index && 'opacity-40',
              dropTarget === index && dragging !== index && 'ring-2 ring-brand',
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="180px"
              draggable={false}
              className="pointer-events-none object-cover"
            />
            <figcaption
              className={cn(
                'absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-2xs font-bold tracking-[0.06em] uppercase',
                index === 0 ? 'bg-brand text-white' : 'bg-white/90 text-ink',
              )}
            >
              {index === 0 ? 'Principal' : index + 1}
            </figcaption>
            {value.length > 1 && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Mover para antes"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink hover:bg-white disabled:invisible"
                >
                  <Chevron direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === value.length - 1}
                  aria-label="Mover para depois"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink hover:bg-white disabled:invisible"
                >
                  <Chevron direction="right" />
                </button>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => move(index, 0)}
                  className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink hover:bg-white"
                >
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remover imagem"
                className="ml-auto rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-danger hover:bg-white"
              >
                Remover
              </button>
            </div>
          </figure>
        ))}

        {Array.from({ length: uploading }).map((_, index) => (
          <div
            key={`uploading-${index}`}
            className="grid aspect-square place-items-center rounded-xl border border-dashed border-line bg-canvas-sunk"
          >
            <Spinner className="h-5 w-5" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0}
          className={cn(
            'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm font-medium transition-colors',
            'text-brand hover:border-brand hover:bg-brand-tint disabled:opacity-45',
            error ? 'border-danger' : 'border-line-strong',
          )}
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adicionar imagens
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          void upload(event.target.files)
          event.target.value = ''
        }}
      />

      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-muted">
          A imagem principal aparece no catálogo. Na página do produto, as fotos seguem esta
          ordem — arraste ou use as setas para reorganizar.
        </p>
      )}
    </div>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  )
}
