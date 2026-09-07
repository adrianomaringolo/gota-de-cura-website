/**
 * Loader de imagem do next/image.
 *
 * O Image Optimization da Vercel é cobrado por transformação; o catálogo, que
 * só cresce, estourou a cota e o `/_next/image` passou a responder HTTP 402.
 * Aqui o redimensionamento é feito pelo wsrv.nl (images.weserv.nl), um proxy de
 * imagem gratuito com CDN própria — nada passa pela Vercel.
 *
 * As larguras pedidas vêm de `images.deviceSizes` / `images.imageSizes` no
 * next.config.ts, então manter esses arrays enxutos ainda importa.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gotadecura.com.br'
).replace(/\/$/, '')

type LoaderArgs = { src: string; width: number; quality?: number }

export default function wsrvLoader({ src, width, quality }: LoaderArgs): string {
  // data:/blob: não têm o que redimensionar.
  if (src.startsWith('data:') || src.startsWith('blob:')) return src

  // Em desenvolvimento o wsrv.nl não alcança o localhost: serve o arquivo direto.
  if (process.env.NODE_ENV === 'development') return src

  const absolute = /^https?:\/\//.test(src) ? src : `${SITE_URL}${src}`

  const params = new URLSearchParams({
    url: absolute,
    w: String(width),
    q: String(quality ?? 70),
    output: 'webp',
    we: '1', // "without enlargement": não amplia imagens menores que `width`
    maxage: '1y', // cache longo na CDN do wsrv
  })

  return `https://wsrv.nl/?${params.toString()}`
}
