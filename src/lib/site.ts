export const SITE = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Gota de Cura',
  tagline: 'Cuidando com amor',
  url: 'https://www.gotadecura.com.br',
  description:
    'Óleos essenciais, hidrolatos e produtos artesanais destilados na Chácara da Mãe Luzia. Toda a renda sustenta os trabalhos assistenciais da Morada Espírita Prof. Lairi Hans.',
  instagram: 'https://www.instagram.com/gotadecura_artesanais/',
  facebook: 'https://www.facebook.com/gotadecura.artesanais',
  testimonyForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSetBUhLfPUyn-AAaeZFSluLuB3BEzrpEX0yirA2CPk6LklYWg/viewform',
  photoAlbum: 'https://photos.app.goo.gl/mUkLpDGD5DUaERqR9',
  store: {
    address: 'Rua José Paulino, 1916 — Campinas, SP',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      'Rua José Paulino, 1916, Campinas - SP',
    )}`,
    hours: [
      ['Segunda a sexta', '9h às 17h'],
      ['Sábado', '8h às 17h'],
    ] as const,
    /** Compact form for tight spots like the hero. */
    hoursShort: 'Seg a sex, 9h às 17h · Sáb, 8h às 17h',
  },
  aromatherapist: {
    name: 'Marcelo Soares Mattar',
    credential: 'Profissional CertAroma — Abraroma',
    link: 'https://www.instagram.com/p/CbaM_GvAs4U/',
    seal: 'https://firebasestorage.googleapis.com/v0/b/gota-de-luz.appspot.com/o/assets%2Fabraroma-certificacao.jpg?alt=media&token=596598f6-d74a-42af-a049-8ea82fae4399',
  },
  morada: {
    name: 'Morada Espírita Prof. Lairi Hans',
    site: 'http://moradaespirita.org',
    facebook: 'https://www.facebook.com/moradaespirita',
    instagram: 'https://instagram.com/moradaespirita',
  },
} as const

/** Visits are open for enrollment. Flip to false to close the funnel. */
export const VISITS_OPEN = true
