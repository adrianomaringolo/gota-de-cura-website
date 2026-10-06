import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getPostLocales, getPosts } from '@/lib/blog'
import { localizedPath } from '@/lib/i18n'
import { productTypes } from '@/lib/product-types'
import { SITE, VISITS_OPEN } from '@/lib/site'

type Entry = MetadataRoute.Sitemap[number]

const url = (path: string) => `${SITE.url}${path}`

/**
 * One entry per page and language, each listing its siblings in the other
 * languages (`alternates.languages`) so crawlers pair them up.
 */
const entries = (
  path: string,
  fields: Omit<Entry, 'url' | 'alternates'>,
  locales: readonly string[] = routing.locales,
): Entry[] => {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, url(localizedPath(path, locale))]),
  )
  return locales.map((locale) => ({
    ...fields,
    url: url(localizedPath(path, locale)),
    alternates: { languages },
  }))
}

/**
 * Product *detail* pages are deliberately absent: their content is fetched from
 * Firestore in the browser, so there is nothing for a crawler to index yet. The
 * shelf pages below are server-rendered and carry the catalogue's real weight.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: Entry[] = [
    ...entries('/', { lastModified: now, changeFrequency: 'weekly', priority: 1 }),
    ...entries('/sobre', { lastModified: now, changeFrequency: 'yearly', priority: 0.7 }),
    ...entries('/blog', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 }),
    ...entries('/videos', {
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
    ...entries('/cromatografias', {
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    ...entries('/visitas', {
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  ]

  // The enrolment form only deserves a slot while the funnel is open.
  if (VISITS_OPEN) {
    staticPages.push(
      ...entries('/visitas/inscricao', {
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      }),
    )
  }

  const categories = productTypes.flatMap((type) =>
    entries(`/${type.id}`, {
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  )

  // A post is listed only in the languages it has actually been written in —
  // the English stand-in for an untranslated post is not indexed.
  const posts = getPosts().flatMap((post) =>
    entries(
      `/blog/${post.slug}`,
      {
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: 'yearly',
        priority: post.featured ? 0.7 : 0.6,
      },
      getPostLocales(post.slug, routing.locales),
    ),
  )

  return [...staticPages, ...categories, ...posts]
}
