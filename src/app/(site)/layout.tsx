import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { JsonLd } from '@/components/site/JsonLd'
import { graph, organizationSchema, websiteSchema } from '@/lib/seo'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/*
        The publisher and site nodes live here so every page carries them. Page
        schemas point at them by `@id`, and crawlers merge all of a page's
        JSON-LD blocks into one graph — a reference emitted only on the homepage
        would dangle everywhere else.
      */}
      <JsonLd schema={graph(organizationSchema(), websiteSchema())} />
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
