import type { Metadata } from 'next'
import { JsonLd } from '@/components/site/JsonLd'
import { PageHeader } from '@/components/site/PageHeader'
import { VideoGrid } from '@/components/videos/VideoGrid'
import { absolute, breadcrumbSchema, graph, ORGANIZATION_ID } from '@/lib/seo'
import { getChannelVideos } from '@/services/youtube'

const DESCRIPTION =
  'Vídeos da Chácara da Mãe Luzia: as plantas do canteiro, o processo de destilação e conversas sobre aromaterapia com o nosso aromaterapeuta.'

/** Match the feed cache in the service — a fresh HTML shell once a day. */
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Vídeos',
  description: DESCRIPTION,
  alternates: { canonical: '/videos' },
  openGraph: {
    type: 'website',
    title: 'Nossos vídeos',
    description: DESCRIPTION,
    url: '/videos',
  },
}

export default async function VideosPage() {
  const videos = await getChannelVideos()

  const schema = graph(
    {
      '@type': 'ItemList',
      '@id': `${absolute('/videos')}#videos`,
      name: 'Vídeos da Gota de Cura',
      description: DESCRIPTION,
      url: absolute('/videos'),
      inLanguage: 'pt-BR',
      publisher: { '@id': ORGANIZATION_ID },
      itemListElement: videos.map((video, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'VideoObject',
          name: video.title,
          description: video.description || video.title,
          thumbnailUrl: video.thumbnail,
          uploadDate: video.publishedAt || undefined,
          url: video.url,
          embedUrl: `https://www.youtube.com/embed/${video.id}`,
        },
      })),
    },
    breadcrumbSchema([
      { name: 'Início', path: '/' },
      { name: 'Vídeos', path: '/videos' },
    ]),
  )

  return (
    <>
      <JsonLd schema={schema} />
      <PageHeader
        title="Nossos vídeos"
        lead="Um passeio pela chácara em movimento: as plantas, a destilaria e conversas sobre o que cada óleo faz de verdade."
      />
      <VideoGrid videos={videos} />
    </>
  )
}
