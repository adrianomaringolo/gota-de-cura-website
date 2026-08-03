import type { MetadataRoute } from 'next'
import { getPosts } from '@/lib/blog'
import { productTypes } from '@/lib/product-types'
import { SITE, VISITS_OPEN } from '@/lib/site'

type Entry = MetadataRoute.Sitemap[number]

const url = (path: string) => `${SITE.url}${path}`

/**
 * Product *detail* pages are deliberately absent: their content is fetched from
 * Firestore in the browser, so there is nothing for a crawler to index yet. The
 * shelf pages below are server-rendered and carry the catalogue's real weight.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: Entry[] = [
    { url: url('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: url('/sobre'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: url('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    {
      url: url('/cromatografias'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: url('/visitas'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  // The enrolment form only deserves a slot while the funnel is open.
  if (VISITS_OPEN) {
    staticPages.push({
      url: url('/visitas/inscricao'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  }

  const categories: Entry[] = productTypes.map((type) => ({
    url: url(`/${type.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const posts: Entry[] = getPosts().map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: 'yearly',
    priority: post.featured ? 0.7 : 0.6,
  }))

  return [...staticPages, ...categories, ...posts]
}
