import { defineRouting } from 'next-intl/routing'

/**
 * Portuguese is the site's own language and keeps every URL it already has;
 * English lives under `/en`. Nobody is redirected by browser language — the
 * switcher in the header is the only way in, so a shared link always opens in
 * the language it was shared in.
 */
export const routing = defineRouting({
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR',
  localePrefix: 'as-needed',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
