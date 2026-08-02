import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

const links = [
  {
    label: '@gotadecura_artesanais',
    short: 'Instagram',
    href: SITE.instagram,
    path: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm8.5 1.5h-8.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zm5.25-.375a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z',
  },
  {
    label: '@gotadecura.artesanais',
    short: 'Facebook',
    href: SITE.facebook,
    path: 'M22 12a10 10 0 1 0-11.5 9.88V14.9h-2.3v-2.9h2.3v-1.8c0-2.3 1.36-3.57 3.46-3.57.7 0 1.6.1 1.6.1v1.9h-.9c-.88 0-1.16.56-1.16 1.14v1.24h2.2l-.36 2.9h-1.84v6.98A10 10 0 0 0 22 12z',
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
              <path d={link.path} />
            </svg>
            {showHandles ? link.label : <span className="sr-only">{link.short}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
