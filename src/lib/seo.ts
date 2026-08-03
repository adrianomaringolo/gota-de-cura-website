import { SITE } from '@/lib/site'

/** Absolute URL for a site-relative path — schema.org wants no relative URLs. */
export const absolute = (path: string) => new URL(path, SITE.url).toString()

const LOGO = absolute('/icon-512.png')

/**
 * The publisher behind every page. Referenced by `@id` from the other schemas so
 * crawlers merge them into one entity instead of three unrelated ones.
 */
export const ORGANIZATION_ID = `${SITE.url}/#organization`

export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE.name,
  slogan: SITE.tagline,
  url: SITE.url,
  description: SITE.description,
  logo: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512 },
  image: absolute('/images/og-default.jpg'),
  sameAs: [SITE.instagram, SITE.facebook],
  // The shop exists to fund the assistance work, which is the parent body.
  parentOrganization: {
    '@type': 'Organization',
    name: SITE.morada.name,
    url: SITE.morada.site,
    sameAs: [SITE.morada.instagram, SITE.morada.facebook],
  },
})

/**
 * Opening hours mirror `SITE.store.hours`, which is prose meant for humans. They
 * are restated here in schema.org's form rather than parsed out of it — keep the
 * two in step when the shop's timetable changes.
 */
export const storeSchema = () => ({
  '@type': 'Store',
  '@id': `${SITE.url}/#store`,
  name: SITE.name,
  url: SITE.url,
  image: absolute('/images/store.jpeg'),
  parentOrganization: { '@id': ORGANIZATION_ID },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua José Paulino, 1916',
    addressLocality: 'Campinas',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  hasMap: SITE.store.mapsUrl,
  currenciesAccepted: 'BRL',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '17:00',
    },
  ],
})

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  inLanguage: 'pt-BR',
  publisher: { '@id': ORGANIZATION_ID },
})

/** `{ name, path }` pairs from the site root down to the current page. */
export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: step.name,
    item: absolute(step.path),
  })),
})

/** Wraps one or more schemas into a single `@graph` document. */
export const graph = (...nodes: object[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
})
