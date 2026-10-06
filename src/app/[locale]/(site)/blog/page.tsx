import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { PostList } from '@/components/blog/PostList'
import { JsonLd } from '@/components/site/JsonLd'
import { getPosts } from '@/lib/blog'
import { intlLocale, languageAlternates, localizedPath } from '@/lib/i18n'
import { absolute, breadcrumbSchema, graph, ORGANIZATION_ID } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  return {
    title: 'Blog',
    description: t('description'),
    alternates: languageAlternates('/blog', locale),
    openGraph: {
      type: 'website',
      title: t('title'),
      description: t('description'),
      url: localizedPath('/blog', locale),
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const posts = getPosts(locale)
  const blogPath = localizedPath('/blog', locale)

  const schema = graph(
    {
      '@type': 'Blog',
      '@id': `${absolute(blogPath)}#blog`,
      name: t('schemaName'),
      description: t('description'),
      url: absolute(blogPath),
      inLanguage: intlLocale(locale),
      publisher: { '@id': ORGANIZATION_ID },
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        url: absolute(localizedPath(`/blog/${post.slug}`, locale)),
      })),
    },
    breadcrumbSchema([
      { name: t('home'), path: localizedPath('/', locale) },
      { name: 'Blog', path: blogPath },
    ]),
  )

  return (
    <>
      <JsonLd schema={schema} />
      <PageHeader title={t('title')} lead={t('lead')} />
      <PostList posts={posts} />
    </>
  )
}
