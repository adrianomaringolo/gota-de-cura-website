import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

/**
 * Everything public is crawlable. The three disallowed branches have nothing a
 * search result should ever land on: the admin panel is authenticated, the cart
 * is per-visitor state, and `/divulgacao` is still a placeholder.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/carrinho', '/divulgacao'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
