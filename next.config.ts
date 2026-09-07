import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // Cada combinação única de (origem × largura × qualidade × formato) conta uma
    // transformação na cota da Vercel, contabilizada só na primeira vez e
    // reaproveitada do cache pelo tempo de `minimumCacheTTL`. Restringir cada
    // eixo mantém o catálogo, que só cresce, dentro do limite gratuito.
    formats: ['image/webp'],
    qualities: [70],
    // 828 quase nunca é visualmente distinto de 640/1200; removê-lo corta uma
    // largura possível por imagem sem perda perceptível.
    deviceSizes: [640, 1200, 1920],
    imageSizes: [128, 256],
    // 1 ano. Seguro porque toda troca de imagem muda a URL: o token do Firebase
    // Storage muda a cada re-upload e o arquivo local muda de hash a cada deploy.
    minimumCacheTTL: 31536000,
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
