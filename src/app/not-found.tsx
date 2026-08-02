import Link from 'next/link'
import { Wordmark } from '@/components/site/Wordmark'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-darkest px-6 py-20 text-white">
      <div className="max-w-lg text-center">
        <Wordmark tone="light" size="md" withTagline className="justify-center" />
        <h1 className="mt-10 font-display text-3xl font-semibold">
          Não encontramos esta página
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-white/70">
          O endereço pode ter mudado de lugar. Volte ao catálogo e a gente te mostra o que
          está saindo do alambique.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-brand-darkest transition-colors hover:bg-brand-soft"
          >
            Página inicial
          </Link>
          <Link
            href="/#catalogo"
            className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            Ver o catálogo
          </Link>
        </div>
      </div>
    </main>
  )
}
