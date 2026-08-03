import type { Metadata } from 'next'
import { EnrollmentForm } from '@/components/visits/EnrollmentForm'

export const metadata: Metadata = {
  title: 'Inscrição para a visitação',
  description:
    'Escolha a data, preencha seus dados e garanta sua vaga na visita guiada à Chácara da Mãe Luzia.',
}

export default function InscricaoPage() {
  return <EnrollmentForm />
}
