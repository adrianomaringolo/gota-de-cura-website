import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Everything except the Portuguese-only internal areas (admin panel, store
  // display), Next internals and files with an extension (images, robots.txt,
  // sitemap.xml, the web manifest…).
  matcher: ['/((?!api|_next|_vercel|admin|vitrine|.*\\..*).*)'],
}
