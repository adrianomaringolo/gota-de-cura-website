import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { BlogBand } from '@/components/home/BlogBand'
import { Catalog } from '@/components/home/Catalog'
import { ContactBand } from '@/components/home/ContactBand'
import { DifferentialsBand } from '@/components/home/DifferentialsBand'
import { Hero } from '@/components/home/Hero'
import { ImpactBand } from '@/components/home/ImpactBand'
import { LaudosBand } from '@/components/home/LaudosBand'
import { LaunchesBand } from '@/components/home/LaunchesBand'
import { Testimonies } from '@/components/home/Testimonies'
import { VideosBand } from '@/components/home/VideosBand'
import { VisitBand } from '@/components/home/VisitBand'
import { JsonLd } from '@/components/site/JsonLd'
import { languageAlternates } from '@/lib/i18n'
import { graph, storeSchema } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { alternates: languageAlternates('/', locale) }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      {/* The shop's address and opening hours belong to the homepage only. */}
      <JsonLd schema={graph(storeSchema())} />
      <Hero />
      <LaunchesBand />
      <Catalog />
      <DifferentialsBand />
      <LaudosBand />
      <VisitBand />
      <Testimonies />
      <BlogBand />
      <VideosBand />
      <ImpactBand />
      <ContactBand />
    </>
  )
}
