import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { ProductType } from '@/lib/types'

/** Category labels carry a <br/> and a <small> for the two hydrosol sizes. */
const plainLabel = (type: ProductType) =>
  (type.typeLabel ?? type.type)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function CategoryTile({
  type,
  priority = false,
}: {
  type: ProductType
  priority?: boolean
}) {
  const featured = Boolean(type.featured)

  return (
    <Link
      href={`/${type.id}`}
      className={cn(
        'group relative isolate flex overflow-hidden rounded-2xl bg-veil',
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand',
        featured ? 'col-span-2 aspect-[16/10] sm:aspect-[16/9]' : 'aspect-4/5',
      )}
    >
      <Image
        src={`/images/categories/${type.image}`}
        alt=""
        fill
        priority={priority}
        sizes={
          featured
            ? '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw'
            : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
        }
        className={cn(
          'object-cover transition-transform duration-[900ms] ease-[var(--ease-out-quart)]',
          'group-hover:scale-[1.06]',
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-gradient-to-t transition-opacity duration-500',
          'from-veil/92 via-veil/30 to-transparent',
          'group-hover:from-veil/96',
        )}
      />

      {type.seal && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={type.seal}
          alt=""
          className="absolute top-3 right-3 w-14 drop-shadow-md sm:w-16"
        />
      )}

      <div className="relative mt-auto flex w-full items-end justify-between gap-3 p-4 sm:p-5">
        <h3
          className={cn(
            'font-display font-semibold text-white text-shadow-photo',
            featured ? 'text-2xl' : 'text-lg leading-tight',
          )}
        >
          {plainLabel(type)}
          {featured && (
            <span className="mt-1 block font-sans text-sm font-normal text-white/70">
              Linha especial
            </span>
          )}
        </h3>

        <span
          aria-hidden="true"
          className={cn(
            'grid shrink-0 place-items-center rounded-full border border-white/35 text-white',
            'transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-out-quart)]',
            'group-hover:border-white group-hover:bg-white group-hover:text-veil',
            featured ? 'h-11 w-11' : 'h-9 w-9',
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={featured ? 'h-5 w-5' : 'h-4 w-4'}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
