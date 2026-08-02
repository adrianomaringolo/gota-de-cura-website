import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

type WordmarkProps = {
  tone?: 'ink' | 'light'
  size?: 'sm' | 'md'
  withTagline?: boolean
  className?: string
}

/**
 * The logo lockup rebuilt at UI scale: the brand droplet plus the wordmark set
 * in the brand's own face, so it stays crisp where the raster logo would not.
 */
export function Wordmark({
  tone = 'ink',
  size = 'sm',
  withTagline = false,
  className,
}: WordmarkProps) {
  const light = tone === 'light'

  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — página inicial`}
      className={cn('group inline-flex items-center gap-2.5', className)}
    >
      <Image
        src={light ? '/images/logos/logo-light-gray.png' : '/images/logos/logo-icon.png'}
        alt=""
        width={83}
        height={120}
        priority
        className={cn(
          'w-auto transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:-translate-y-0.5',
          size === 'sm' ? 'h-9' : 'h-14',
        )}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-[family-name:var(--font-wordmark)] lowercase',
            size === 'sm' ? 'text-lg' : 'text-3xl',
            light ? 'text-white' : 'text-brand',
          )}
          style={{ letterSpacing: '-0.01em' }}
        >
          gota de cura
        </span>
        {withTagline && (
          // Amarillo carries tall ascenders; it needs its own line box or it
          // climbs into the wordmark above it.
          <span
            className={cn(
              'font-[family-name:var(--font-script)] mt-1.5 self-end pr-0.5 leading-none',
              size === 'sm' ? 'text-xs' : 'text-base',
              light ? 'text-brand-soft' : 'text-brand-lift',
            )}
          >
            {SITE.tagline}
          </span>
        )}
      </span>
    </Link>
  )
}
