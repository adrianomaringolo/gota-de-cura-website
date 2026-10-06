import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/site/JsonLd'
import { PageHeader } from '@/components/site/PageHeader'
import { VideoGrid } from '@/components/videos/VideoGrid'
import { intlLocale, languageAlternates, localizedPath } from '@/lib/i18n'
import { absolute, breadcrumbSchema, graph, ORGANIZATION_ID } from '@/lib/seo'
import { getChannelVideos } from '@/services/youtube'

/** Match the feed cache in the service — a fresh HTML shell once a day. */
export const revalidate = 86400

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'videosPage' })

  return {
    title: t('metaTitle'),
    description: t('description'),
    alternates: languageAlternates('/videos', locale),
    openGraph: {
      type: 'website',
      title: t('title'),
      description: t('description'),
      url: localizedPath('/videos', locale),
    },
  }
}

export default async function VideosPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('videosPage')
  const videos = await getChannelVideos()
  const path = localizedPath('/videos', locale)

  const schema = graph(
    {
      '@type': 'ItemList',
      '@id': `${absolute(path)}#videos`,
      name: t('schemaName'),
      description: t('description'),
      url: absolute(path),
      // The videos themselves are always in Portuguese.
      inLanguage: intlLocale('pt-BR'),
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
      { name: t('home'), path: localizedPath('/', locale) },
      { name: t('metaTitle'), path },
    ]),
  )

  return (
    <>
      <JsonLd schema={schema} />
      <PageHeader title={t('title')} lead={t('lead')} />
      <VideoGrid videos={videos} />
    </>
  )
}
