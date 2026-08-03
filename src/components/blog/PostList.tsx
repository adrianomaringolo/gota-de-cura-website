'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import type { PostSummary } from '@/lib/types'
import { Container } from '@/components/site/Section'
import { EmptyState } from '@/components/ui/Feedback'
import { PostCard } from './PostCard'

export function PostList({ posts }: { posts: PostSummary[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  // Tags ordered by how much they are actually used, so the filter row leads
  // with the subjects the blog is really about.
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) map.set(tag, (map.get(tag) ?? 0) + 1)
    }
    return map
  }, [posts])

  const tags = useMemo(
    () => [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!),
    [counts],
  )

  const filtered = useMemo(
    () => (selected ? posts.filter((post) => post.tags.includes(selected)) : posts),
    [posts, selected],
  )

  return (
    <section className="bg-canvas py-16 lg:py-20">
      <Container>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por assunto">
            {[null, ...tags].map((tag) => {
              const active = selected === tag

              return (
                <button
                  key={tag ?? 'todos'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(tag)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium',
                    'transition-colors duration-200',
                    active
                      ? 'bg-brand text-white'
                      : 'bg-brand-tint text-brand hover:bg-brand-soft',
                  )}
                >
                  {tag ?? 'Todos'}
                  <span className={cn('tabular-nums', active ? 'text-white/60' : 'opacity-50')}>
                    {tag ? counts.get(tag) : posts.length}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {filtered.length > 0 ? (
          <ul className={cn('divide-y divide-line border-y border-line', tags.length > 0 && 'mt-10')}>
            {filtered.map((post, index) => (
              <li key={post.slug}>
                <PostCard post={post} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className={tags.length > 0 ? 'mt-10' : undefined}
            title="Nada por aqui ainda"
          >
            {selected
              ? 'Nenhum texto com esse assunto por enquanto. Experimente outro filtro.'
              : 'Os primeiros textos estão sendo escritos. Volte em breve.'}
          </EmptyState>
        )}
      </Container>
    </section>
  )
}
