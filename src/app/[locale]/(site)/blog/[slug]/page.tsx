import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/site/Section'
import { PostBody } from '@/components/blog/PostBody'
import { PostCard } from '@/components/blog/PostCard'
import { JsonLd } from '@/components/site/JsonLd'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getPost, getPostLocales, getPosts, getRelatedPosts } from '@/lib/blog'
import { formatPostDate } from '@/lib/format'
import { intlLocale, localizedPath } from '@/lib/i18n'
import { absolute, breadcrumbSchema, graph, ORGANIZATION_ID } from '@/lib/seo'

type PostPageProps = { params: Promise<{ locale: string; slug: string }> }

/**
 * Every post exists in Portuguese; a translation is an `index.en.md` beside it.
 * Until it is written, the English URL shows the Portuguese text with a notice,
 * so the language switch never lands on a 404. That stand-in page is not
 * indexed and points its canonical at the original.
 */
const loadPost = (slug: string, locale: string) => {
  const translated = getPost(slug, locale)
  if (translated) return { post: translated, untranslated: false }

  const original = getPost(slug, routing.defaultLocale)
  return original ? { post: original, untranslated: true } : undefined
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  // The Portuguese list is the full one; untranslated posts still get an
  // English page (see `loadPost`).
  void params
  return getPosts(routing.defaultLocale).map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const loaded = loadPost(slug, locale)
  const t = await getTranslations({ locale, namespace: 'post' })

  if (!loaded) return { title: t('notFoundTitle') }

  const { post, untranslated } = loaded
  const path = `/blog/${post.slug}`
  const available = getPostLocales(post.slug, routing.locales)

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: localizedPath(path, untranslated ? routing.defaultLocale : locale),
      languages: Object.fromEntries(
        available.map((language) => [language, localizedPath(path, language)]),
      ),
    },
    ...(untranslated && { robots: { index: false, follow: true } }),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: localizedPath(path, locale),
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
  const { locale, slug } = await params
  setRequestLocale(locale)
  const loaded = loadPost(slug, locale)

  if (!loaded) notFound()

  const { post, untranslated } = loaded
  const t = await getTranslations('post')
  const related = getRelatedPosts(post.slug, post.tags, locale)
  const contentLocale = untranslated ? routing.defaultLocale : locale

  const url = absolute(localizedPath(`/blog/${post.slug}`, contentLocale))
  const blogUrl = absolute(localizedPath('/blog', contentLocale))

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
      inLanguage: intlLocale(contentLocale),
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      isPartOf: { '@id': `${blogUrl}#blog` },
      image: post.image ? absolute(post.image) : absolute('/images/og-default.jpg'),
      author: {
        '@type': 'Organization',
        name: post.author,
        url: absolute(localizedPath('/sobre', contentLocale)),
      },
      publisher: { '@id': ORGANIZATION_ID },
    },
    breadcrumbSchema([
      { name: t('home'), path: localizedPath('/', locale) },
      { name: 'Blog', path: localizedPath('/blog', locale) },
      { name: post.title, path: localizedPath(`/blog/${post.slug}`, locale) },
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
            {t('all')}
          </Link>

          {untranslated && (
            <p className="mt-8 max-w-[60ch] rounded-2xl bg-white/10 px-5 py-3 text-sm text-white/85">
              {t('untranslated')}
            </p>
          )}

          <h1
            lang={untranslated ? contentLocale : undefined}
            className="mt-8 text-4xl leading-tight font-semibold"
          >
            {post.title}
          </h1>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>{post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt, locale)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{t('readingTime', { minutes: post.readingTime })}</span>
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

      <article
        lang={untranslated ? contentLocale : undefined}
        className="bg-canvas py-14 lg:py-20"
      >
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
                {t('summary')}
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
            <h2 className="rule-mark text-2xl font-semibold text-ink">{t('related')}</h2>
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
