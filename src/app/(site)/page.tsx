import { Catalog } from '@/components/home/Catalog'
import { ContactBand } from '@/components/home/ContactBand'
import { Hero } from '@/components/home/Hero'
import { ImpactBand } from '@/components/home/ImpactBand'
import { LaudosBand } from '@/components/home/LaudosBand'
import { Testimonies } from '@/components/home/Testimonies'
import { VisitBand } from '@/components/home/VisitBand'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Catalog />
      <LaudosBand />
      <VisitBand />
      <Testimonies />
      <ImpactBand />
      <ContactBand />
    </>
  )
}
