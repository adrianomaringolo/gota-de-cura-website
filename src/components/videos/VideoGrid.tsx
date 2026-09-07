import { Container } from '@/components/site/Section'
import { EmptyState } from '@/components/ui/Feedback'
import { SITE } from '@/lib/site'
import type { YoutubeVideo } from '@/lib/types'
import { VideoCard } from './VideoCard'

export function VideoGrid({ videos }: { videos: YoutubeVideo[] }) {
  const [lead, ...rest] = videos

  return (
    <section className="bg-canvas py-16 lg:py-20">
      <Container>
        {videos.length > 0 ? (
          <>
            <div className="mx-auto max-w-3xl">
              <VideoCard video={lead} featured />
            </div>

            {rest.length > 0 && (
              <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((video) => (
                  <li key={video.id}>
                    <VideoCard video={video} />
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-16 text-center">
              <a
                href={SITE.youtube}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-deep"
              >
                Ver o canal no YouTube
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </>
        ) : (
          <EmptyState
            title="Os vídeos não carregaram agora"
            action={
              <a
                href={SITE.youtube}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-deep"
              >
                Abrir o canal no YouTube
              </a>
            }
          >
            Tente recarregar a página em instantes, ou assista direto no nosso canal.
          </EmptyState>
        )}
      </Container>
    </section>
  )
}
