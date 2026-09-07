import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

/**
 * Everything public is crawlable. The disallowed branches have nothing a
 * search result should ever land on: the admin panel is authenticated, the cart
 * is per-visitor state, `/divulgacao` is still a placeholder, and `/vitrine` is
 * the in-store tablet display, reachable only from the tablet itself.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/carrinho', '/divulgacao', '/vitrine'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
