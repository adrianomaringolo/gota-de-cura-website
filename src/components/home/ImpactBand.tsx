import Image from 'next/image'
import { Container } from '@/components/site/Section'
import { SITE } from '@/lib/site'

const links = [
  { label: 'Site', href: SITE.morada.site },
  { label: 'Instagram', href: SITE.morada.instagram },
  { label: 'Facebook', href: SITE.morada.facebook },
]

export function ImpactBand() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-darkest text-white">
      <Image
        src="/images/visit/photo-12.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-brand-darkest via-brand-darkest/90 to-brand-darkest/55"
      />

      <Container className="relative py-24 lg:py-32">
        <div className="max-w-[52ch]">
          <h2 className="rule-mark text-3xl font-semibold">
            O lucro daqui vira pão na mesa de alguém
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            A Gota de Cura não tem dono nem sócios. Toda a renda das vendas é revertida
            para a{' '}
            <strong className="font-semibold text-white">{SITE.morada.name}</strong> e
            para o seu trabalho de assistência às famílias da periferia de Campinas,
            mantido desde 1980.
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            A chácara é da Morada. Quem planta, colhe, destila e embala são voluntários.
          </p>

          <ul className="mt-9 flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-brand-darkest"
                >
                  {link.label}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
