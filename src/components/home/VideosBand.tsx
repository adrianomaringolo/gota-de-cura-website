import Link from 'next/link'
import { Container, SectionHead } from '@/components/site/Section'
import { VideoCard } from '@/components/videos/VideoCard'
import { getChannelVideos } from '@/services/youtube'

export async function VideosBand() {
  const videos = await getChannelVideos(3)

  if (videos.length === 0) return null

  return (
    <section className="bg-canvas py-20 lg:py-24">
      <Container>
        <SectionHead
          title="A chácara em vídeo"
          lead="Do canteiro à destilaria, e as plantas do catálogo apresentadas uma a uma pelo nosso aromaterapeuta."
          aside={
            <Link
              href="/videos"
              className="group inline-flex items-center gap-2 text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
            >
              Ver todos os vídeos
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          }
        />

        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
