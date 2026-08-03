import GithubSlugger from 'github-slugger'
import { Children, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Heading = { id: string; text: string; level: 2 | 3 }

/**
 * Headings are pulled from the raw markdown rather than from the rendered tree,
 * skipping fenced code blocks — a code sample can itself contain lines starting
 * with `#`. This walk owns its own slugger so the ids it mints match, in order,
 * the ones the heading renderers below look up.
 */
const extractHeadings = (markdown: string): Heading[] => {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []

  for (const line of markdown.replace(/```[\s\S]*?```/g, '').split('\n')) {
    const h3 = /^###\s+(.+)$/.exec(line)
    const h2 = !h3 && /^##\s+(.+)$/.exec(line)
    const match = h3 ?? h2
    if (!match) continue

    const text = match[1].replace(/[`*_]/g, '').trim()
    headings.push({ id: slugger.slug(text), text, level: h3 ? 3 : 2 })
  }

  return headings
}

const textOf = (children: ReactNode): string =>
  Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .join('')

export function PostBody({ content }: { content: string }) {
  const headings = extractHeadings(content)

  // A plain lookup, not a live slugger call from inside the renderers: a
  // GithubSlugger mutates on every `.slug()`, so a heading rendered twice would
  // get a suffixed id the second time and drift from the index's href.
  const idByText: Record<string, string> = {}
  for (const heading of headings) idByText[heading.text] = heading.id

  return (
    <>
      {headings.length > 0 && (
        <nav
          aria-label="Neste texto"
          className="mb-10 rounded-2xl border border-line bg-canvas-sunk px-6 py-5"
        >
          <p className="text-2xs font-bold tracking-[0.14em] text-ink-muted uppercase">
            Neste texto
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {headings.map((heading) => (
              <li key={heading.id} className={heading.level === 3 ? 'pl-4' : undefined}>
                <a
                  href={`#${heading.id}`}
                  className="text-ink-soft underline decoration-transparent underline-offset-4 transition-colors hover:text-brand hover:decoration-brand/40"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <ReactMarkdown
        // react-markdown ships CommonMark only, which has no tables — without
        // gfm the `table` renderers below could never fire.
        remarkPlugins={[remarkGfm]}
        components={{
          // Demoted to h2: the page title is already the document's only h1, and
          // a `#` in the body must not compete with it in the outline.
          h1: ({ children }) => (
            <h2
              id={idByText[textOf(children)]}
              className="mt-12 mb-4 scroll-mt-28 font-display text-2xl font-semibold text-ink first:mt-0"
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2
              id={idByText[textOf(children)]}
              className="mt-12 mb-4 scroll-mt-28 font-display text-2xl font-semibold text-ink first:mt-0"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={idByText[textOf(children)]}
              className="mt-9 mb-3 scroll-mt-28 font-display text-xl font-semibold text-ink"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-5 max-w-[68ch] text-lg leading-relaxed text-ink-soft">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 max-w-[68ch] list-disc space-y-2 pl-6 text-lg leading-relaxed text-ink-soft">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 max-w-[68ch] list-decimal space-y-2 pl-6 text-lg leading-relaxed text-ink-soft">
              {children}
            </ol>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          a: ({ children, href }) => {
            const external = href?.startsWith('http')

            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className="text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
              >
                {children}
              </a>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-2 border-brand/30 pl-5 text-lg leading-relaxed text-ink-muted italic [&>p]:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-line" />,
          // No syntax highlighting: this blog is about aromatherapy, so a
          // preformatted block is a measurement or a recipe, not source code.
          // It reads as a quiet aside in the page's own palette.
          code: ({ children, className }) =>
            className?.includes('language-') ? (
              <code className="block font-mono text-sm leading-relaxed text-ink">
                {children}
              </code>
            ) : (
              <code className="rounded bg-brand-tint px-1.5 py-0.5 font-mono text-[0.9em] text-brand">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="mb-6 overflow-x-auto rounded-2xl border border-line bg-canvas-sunk px-5 py-4">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mb-6 overflow-x-auto rounded-xl border border-line">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-line bg-canvas-sunk px-4 py-3 font-semibold text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-line px-4 py-3 align-top text-ink-soft">
              {children}
            </td>
          ),
          // eslint-disable-next-line @next/next/no-img-element -- post images are
          // authored in markdown, so their intrinsic size is not known here.
          img: ({ src, alt }) => (
            <span className="my-8 block">
              <img
                src={typeof src === 'string' ? src : undefined}
                alt={alt ?? ''}
                loading="lazy"
                className="w-full rounded-2xl"
              />
              {alt && (
                <span className="mt-2 block text-center text-sm text-ink-muted italic">
                  {alt}
                </span>
              )}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </>
  )
}
