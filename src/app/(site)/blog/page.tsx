import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/PageHeader'
import { PostList } from '@/components/blog/PostList'
import { getPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Aromaterapia na prática, o que acontece na Chácara da Mãe Luzia e como cada óleo essencial sai do canteiro para o frasco.',
}

export default function BlogPage() {
  const posts = getPosts()

  return (
    <>
      <PageHeader
        title="Venha aprender com a gente"
        lead="Aromaterapia sem misticismo e sem promessa: o que plantamos, como destilamos e o que cada óleo faz de verdade."
      />
      <PostList posts={posts} />
    </>
  )
}
