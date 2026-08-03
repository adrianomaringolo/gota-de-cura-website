import Image from 'next/image'
import Link from 'next/link'
import { formatPostDateShort } from '@/lib/format'
import type { PostSummary } from '@/lib/types'

/**
 * A listing row rather than a tile: posts are read in sequence, and a row lets
 * the excerpt earn its space instead of being clipped to fit a grid cell.
 */
export function PostCard({ post, index = 0 }: { post: PostSummary; index?: number }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex items-start gap-4 py-6">
      <span className="w-6 shrink-0 pt-1 text-sm text-ink-muted/50 tabular-nums select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {post.image && (
        <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-xl bg-canvas-sunk sm:w-32">
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-105"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg leading-snug font-semibold text-ink transition-colors group-hover:text-brand">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {post.excerpt}
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          {formatPostDateShort(post.publishedAt)} · {post.readingTime} min de leitura
          {post.tags.length > 0 && <> · {post.tags.slice(0, 2).join(' · ')}</>}
        </p>
      </div>

      <svg
        viewBox="0 0 24 24"
        className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  )
}
