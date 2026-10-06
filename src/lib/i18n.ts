import { routing, type Locale } from '@/i18n/routing'

export type { Locale }

/** The BCP 47 tag `Intl` formats with — `en` alone would pick no region. */
export const intlLocale = (locale: string): string =>
  locale === 'en' ? 'en-US' : 'pt-BR'

/** Open Graph wants an underscore: `pt_BR`, `en_US`. */
export const ogLocale = (locale: string): string => intlLocale(locale).replace('-', '_')

export const isDefaultLocale = (locale: string) => locale === routing.defaultLocale

/** The public path of `path` in `locale`: Portuguese has no prefix, English has `/en`. */
export const localizedPath = (path: string, locale: string): string =>
  isDefaultLocale(locale) ? path : `/${locale}${path === '/' ? '' : path}`

/**
 * `alternates` for a page that exists in every language: the canonical in the
 * current one plus an `hreflang` link for each, with Portuguese as `x-default`.
 */
export const languageAlternates = (path: string, locale: string) => ({
  canonical: localizedPath(path, locale),
  languages: {
    ...Object.fromEntries(routing.locales.map((l) => [l, localizedPath(path, l)])),
    'x-default': localizedPath(path, routing.defaultLocale),
  },
})
