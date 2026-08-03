import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
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
