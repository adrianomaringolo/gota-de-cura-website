import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // O redimensionamento é feito por um proxy externo (wsrv.nl), não pelo Image
    // Optimization da Vercel, que é cobrado por transformação e estourou a cota
    // (HTTP 402). Ver image-loader.ts. `deviceSizes`/`imageSizes` continuam
    // definindo as larguras que o Next pede ao loader — mantê-los enxutos evita
    // baixar variantes grandes à toa.
    loader: 'custom',
    loaderFile: './image-loader.ts',
    deviceSizes: [640, 1200, 1920],
    imageSizes: [128, 256],
  },
  async redirects() {
    return [
      {
        source: '/depoimento',
        destination:
          'https://docs.google.com/forms/d/e/1FAIpQLSetBUhLfPUyn-AAaeZFSluLuB3BEzrpEX0yirA2CPk6LklYWg/viewform',
        permanent: false,
      },
      {
        source: '/youtube',
        destination: 'https://www.youtube.com/channel/UCq6y4YcG2WBqZyM5Y5MhNoA',
        permanent: false,
      },
      {
        source: '/oficina-saboaria',
        destination: 'https://forms.gle/Umb2hthyDgCNxEGHA',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
