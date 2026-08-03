import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/PageHeader'
import { PostList } from '@/components/blog/PostList'
import { JsonLd } from '@/components/site/JsonLd'
import { getPosts } from '@/lib/blog'
import { absolute, breadcrumbSchema, graph, ORGANIZATION_ID } from '@/lib/seo'

const DESCRIPTION =
  'Aromaterapia na prática, o que acontece na Chácara da Mãe Luzia e como cada óleo essencial sai do canteiro para o frasco.'

export const metadata: Metadata = {
  title: 'Blog',
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: 'Venha aprender com a gente',
    description: DESCRIPTION,
    url: '/blog',
  },
}

export default function BlogPage() {
  const posts = getPosts()

  const schema = graph(
    {
      '@type': 'Blog',
      '@id': `${absolute('/blog')}#blog`,
      name: 'Blog da Gota de Cura',
      description: DESCRIPTION,
      url: absolute('/blog'),
      inLanguage: 'pt-BR',
      publisher: { '@id': ORGANIZATION_ID },
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        url: absolute(`/blog/${post.slug}`),
      })),
    },
    breadcrumbSchema([
      { name: 'Início', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
  )

  return (
    <>
      <JsonLd schema={schema} />
      <PageHeader
        title="Venha aprender com a gente"
        lead="Aromaterapia sem misticismo e sem promessa: o que plantamos, como destilamos e o que cada óleo faz de verdade."
      />
      <PostList posts={posts} />
    </>
  )
}
