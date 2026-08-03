import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

type WordmarkProps = {
  tone?: 'ink' | 'light'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * The brand lockup — droplet, wordmark and tagline are all baked into the one
 * asset, so nothing here reproduces them in type. On the dark violet bands the
 * artwork's own violet would sink into the background, so `light` knocks it out
 * to solid white.
 */
export function Wordmark({ tone = 'ink', size = 'sm', className }: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — página inicial`}
      className={cn('group inline-flex items-center', className)}
    >
      <Image
        src="/images/logos/logo.png"
        alt=""
        width={1641}
        height={535}
        priority
        className={cn(
          'w-auto transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:-translate-y-0.5',
          size === 'sm' ? 'h-11' : 'h-20',
          tone === 'light' && 'brightness-0 invert',
        )}
      />
    </Link>
  )
}
