import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/site/Section'
import { PostBody } from '@/components/blog/PostBody'
import { PostCard } from '@/components/blog/PostCard'
import { JsonLd } from '@/components/site/JsonLd'
import { getPost, getPosts, getRelatedPosts } from '@/lib/blog'
import { formatPostDate } from '@/lib/format'
import { absolute, breadcrumbSchema, graph, ORGANIZATION_ID } from '@/lib/seo'

type PostPageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) return { title: 'Texto não encontrado' }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      // Post images vary in size, so only the fallback declares dimensions.
      images: post.image
        ? [{ url: post.image, alt: post.title }]
        : [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image ?? '/images/og-default.jpg'],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) notFound()

  const related = getRelatedPosts(post.slug, post.tags)

  const url = absolute(`/blog/${post.slug}`)

  const schema = graph(
    {
      '@type': 'BlogPosting',
      '@id': `${url}#post`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      keywords: post.tags.join(', '),
      articleSection: post.tags[0],
      wordCount: post.content.trim().split(/\s+/).length,
      timeRequired: `PT${post.readingTime}M`,
      inLanguage: 'pt-BR',
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      isPartOf: { '@id': `${absolute('/blog')}#blog` },
      image: post.image ? absolute(post.image) : absolute('/images/og-default.jpg'),
      author: { '@type': 'Organization', name: post.author, url: absolute('/sobre') },
      publisher: { '@id': ORGANIZATION_ID },
    },
    breadcrumbSchema([
      { name: 'Início', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  )

  return (
    <>
      <JsonLd schema={schema} />

      <header className="relative overflow-hidden bg-brand-darkest text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-24 h-96 w-96 rounded-full bg-brand-lift/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-[52rem] px-4 pt-32 pb-14 sm:px-6 lg:pt-40 lg:pb-16">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Todos os textos
          </Link>

          <h1 className="mt-8 text-4xl leading-tight font-semibold">{post.title}</h1>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>{post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min de leitura</span>
          </p>

          {post.tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <article className="bg-canvas py-14 lg:py-20">
        <div className="mx-auto max-w-[52rem] px-4 sm:px-6">
          {post.image && (
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={630}
              priority
              className="mb-12 w-full rounded-2xl"
            />
          )}

          {(post.tldr.length > 0 || post.excerpt) && (
            <aside className="mb-12 rounded-2xl border border-brand/20 bg-brand-tint px-6 py-5">
              <p className="text-2xs font-bold tracking-[0.14em] text-brand uppercase">
                Em resumo
              </p>
              {post.tldr.length > 0 ? (
                <ul className="mt-3 space-y-2 text-base leading-relaxed text-ink-soft">
                  {post.tldr.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="mt-2 text-xs text-brand/60">
                        ▸
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              )}
            </aside>
          )}

          <PostBody content={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-canvas-sunk py-16 lg:py-20">
          <Container className="max-w-[52rem]">
            <h2 className="rule-mark text-2xl font-semibold text-ink">Para ler depois</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {related.map((post, index) => (
                <li key={post.slug}>
                  <PostCard post={post} index={index} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  )
}
