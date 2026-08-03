import Image from 'next/image'
import Link from 'next/link'
import { Container, SectionHead } from '@/components/site/Section'
import { getPosts } from '@/lib/blog'
import { formatPostDateShort } from '@/lib/format'

export function BlogBand() {
  const posts = getPosts()

  if (posts.length === 0) return null

  const [lead, ...rest] = posts
  const sidebar = rest.slice(0, 3)

  return (
    <section className="bg-canvas-sunk py-20 lg:py-24">
      <Container>
        <SectionHead
          title="Para ler com calma"
          aside={
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
            >
              Todos os textos
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
          }
        />

        {/* The side column only earns its keep once there is something to put in
            it — with a single post the lead card runs the full width instead of
            leaving a stranded empty rail. */}
        <div
          className={
            sidebar.length > 0
              ? 'mt-10 grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14'
              : 'mt-10'
          }
        >
          {/* Image beside the copy rather than above it: at full container width
              a 16/9 lead image dominated the band and pushed the text below the
              fold of the section. */}
          <Link
            href={`/blog/${lead.slug}`}
            className="group grid gap-5 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:items-start sm:gap-7"
          >
            {lead.image && (
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-canvas">
                <Image
                  src={lead.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 256px"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.03]"
                />
              </div>
            )}

            <div>
              <h3 className="font-display text-2xl leading-snug font-semibold text-ink transition-colors group-hover:text-brand">
                {lead.title}
              </h3>
              <p className="mt-3 line-clamp-3 max-w-[62ch] text-base leading-relaxed text-ink-soft">
                {lead.excerpt}
              </p>
              <p className="mt-3 text-sm text-ink-muted">
                {formatPostDateShort(lead.publishedAt)} · {lead.readingTime} min de leitura
              </p>
            </div>
          </Link>

          {sidebar.length > 0 && (
            <ul className="divide-y divide-line border-t border-line lg:border-t-0 lg:border-l lg:border-line lg:pl-10">
              {sidebar.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group flex gap-3.5 py-5">
                    {post.image && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-canvas">
                        <Image
                          src={post.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 font-display leading-snug font-semibold text-ink transition-colors group-hover:text-brand">
                        {post.title}
                      </h4>
                      <p className="mt-1 text-sm text-ink-muted">
                        {formatPostDateShort(post.publishedAt)} · {post.readingTime} min
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  )
}
