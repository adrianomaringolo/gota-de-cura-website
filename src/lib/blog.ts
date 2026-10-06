import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostSummary } from '@/lib/types'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog')

/**
 * Post folders are named `YYYY-MM-DD-slug`. The date prefix orders the files on
 * disk only — it is stripped to produce the public route, so reorganising a
 * folder never changes a published URL. A leading `_` marks a draft and keeps
 * the folder out of every listing and out of `generateStaticParams`.
 */
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/

/**
 * Each folder holds `index.md` (Portuguese) and, once translated, `index.en.md`
 * beside it, sharing the folder's images and slug. A post with no file for a
 * language simply does not exist in that language: it is left out of that
 * listing, and its page there is a 404.
 */
const fileFor = (locale: string) => (locale === 'en' ? 'index.en.md' : 'index.md')

const DEFAULT_AUTHOR: Record<string, string> = {
  'pt-BR': 'Equipe Gota de Cura',
  en: 'The Gota de Cura team',
}

/** Roughly 200 words a minute, floored at one so nothing reads "0 min". */
const readingTime = (content: string): number =>
  Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))

type Entry = { slug: string; dir: string }

const entries = (): Entry[] => {
  if (!fs.existsSync(CONTENT_DIR)) return []

  return fs
    .readdirSync(CONTENT_DIR)
    .filter(
      (name) =>
        !name.startsWith('_') && fs.statSync(path.join(CONTENT_DIR, name)).isDirectory(),
    )
    .map((dir) => ({ slug: dir.replace(DATE_PREFIX, ''), dir }))
}

const read = (dir: string, locale: string) => {
  const file = path.join(CONTENT_DIR, dir, fileFor(locale))
  if (!fs.existsSync(file)) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf-8'))
  return { data: data as Record<string, unknown>, content }
}

const toSummary = (
  slug: string,
  data: Record<string, unknown>,
  content: string,
  locale: string,
): PostSummary => ({
  slug,
  title: (data.title as string) ?? slug,
  excerpt: (data.excerpt as string) ?? '',
  author: (data.author as string) ?? DEFAULT_AUTHOR[locale] ?? DEFAULT_AUTHOR['pt-BR'],
  publishedAt: (data.publishedAt as string) ?? '',
  readingTime: (data.readingTime as number) || readingTime(content),
  tags: (data.tags as string[]) ?? [],
  featured: (data.featured as boolean) ?? false,
  image: data.image as string | undefined,
})

export const getPosts = (locale = 'pt-BR'): PostSummary[] =>
  entries()
    .map(({ slug, dir }) => {
      const file = read(dir, locale)
      return file ? toSummary(slug, file.data, file.content, locale) : null
    })
    .filter((post): post is PostSummary => post !== null)
    // Newest first. Plain string comparison is safe and timezone-proof for
    // `YYYY-MM-DD`, where lexical order is chronological order.
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))

export const getPost = (slug: string, locale = 'pt-BR'): Post | undefined => {
  const entry = entries().find((candidate) => candidate.slug === slug)
  if (!entry) return undefined

  const file = read(entry.dir, locale)
  if (!file) return undefined

  return {
    ...toSummary(slug, file.data, file.content, locale),
    content: file.content,
    tldr: (file.data.tldr as string[]) ?? [],
  }
}

/** The languages a post has been written in — what its `hreflang` links list. */
export const getPostLocales = (slug: string, locales: readonly string[]): string[] => {
  const entry = entries().find((candidate) => candidate.slug === slug)
  if (!entry) return []
  return locales.filter((locale) =>
    fs.existsSync(path.join(CONTENT_DIR, entry.dir, fileFor(locale))),
  )
}

export const getFeaturedPosts = (locale = 'pt-BR'): PostSummary[] =>
  getPosts(locale).filter((post) => post.featured)

/** Posts sharing at least one tag, most recent first. */
export const getRelatedPosts = (
  slug: string,
  tags: string[],
  locale = 'pt-BR',
  limit = 3,
): PostSummary[] =>
  getPosts(locale)
    .filter((post) => post.slug !== slug)
    .filter((post) => post.tags.some((tag) => tags.includes(tag)))
    .slice(0, limit)
