import { siFacebook, siInstagram } from 'simple-icons'

import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

const links = [
  {
    label: '@gotadecura_artesanais',
    href: SITE.instagram,
    icon: siInstagram,
  },
  {
    label: '@gotadecura.artesanais',
    href: SITE.facebook,
    icon: siFacebook,
  },
]

export function SocialLinks({
  className,
  tone = 'ink',
  showHandles = false,
}: {
  className?: string
  tone?: 'ink' | 'light'
  showHandles?: boolean
}) {
  const light = tone === 'light'

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'inline-flex items-center gap-2.5 rounded-full text-sm font-medium transition-colors duration-200',
              showHandles ? 'px-4 py-2.5' : 'h-11 w-11 justify-center',
              light
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-brand-tint text-brand hover:bg-brand-soft',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={link.icon.path} />
            </svg>
            {showHandles ? link.label : <span className="sr-only">{link.icon.title}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
