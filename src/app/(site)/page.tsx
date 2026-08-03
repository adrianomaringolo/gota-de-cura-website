import type { Metadata } from 'next'
import { BlogBand } from '@/components/home/BlogBand'
import { Catalog } from '@/components/home/Catalog'
import { ContactBand } from '@/components/home/ContactBand'
import { DifferentialsBand } from '@/components/home/DifferentialsBand'
import { Hero } from '@/components/home/Hero'
import { ImpactBand } from '@/components/home/ImpactBand'
import { LaudosBand } from '@/components/home/LaudosBand'
import { Testimonies } from '@/components/home/Testimonies'
import { VisitBand } from '@/components/home/VisitBand'
import { JsonLd } from '@/components/site/JsonLd'
import { graph, storeSchema } from '@/lib/seo'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      {/* The shop's address and opening hours belong to the homepage only. */}
      <JsonLd schema={graph(storeSchema())} />
      <Hero />
      <DifferentialsBand />
      <Catalog />
      <LaudosBand />
      <VisitBand />
      <Testimonies />
      <BlogBand />
      <ImpactBand />
      <ContactBand />
    </>
  )
}
