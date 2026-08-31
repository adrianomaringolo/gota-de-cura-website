import { SITE } from '@/lib/site'
import type { YoutubeVideo } from '@/lib/types'

/**
 * The channel's public uploads feed. No API key, no quota — YouTube publishes
 * the last ~15 uploads as Atom XML. Enough for a "latest videos" page; if the
 * channel ever needs deeper history, that is the point to move to the Data API.
 */
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`

/** Re-fetch the feed at most once a day — uploads are not frequent. */
const REVALIDATE_SECONDS = 24 * 60 * 60

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
}

/** The feed double-encodes text: `&amp;#39;` for an apostrophe, etc. */
function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (match) => ENTITIES[match] ?? match)
}

function tag(entry: string, name: string): string | null {
  const match = entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))
  return match ? decodeXml(match[1].trim()) : null
}

function parseEntry(entry: string): YoutubeVideo | null {
  const id = tag(entry, 'yt:videoId')
  const title = tag(entry, 'title')
  if (!id || !title) return null

  const thumb = entry.match(/<media:thumbnail\s+url="([^"]+)"/)
  const views = entry.match(/<media:statistics\s+views="(\d+)"/)

  return {
    id,
    title,
    description: tag(entry, 'media:description') ?? '',
    publishedAt: tag(entry, 'published') ?? '',
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: thumb?.[1] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    views: views ? Number(views[1]) : null,
  }
}

/**
 * The latest uploads, newest first. Returns `[]` on any failure — the page
 * degrades to an empty state with a link to the channel rather than erroring.
 */
export async function getChannelVideos(limit = 12): Promise<YoutubeVideo[]> {
  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return []

    const xml = await response.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []

    return entries
      .map(parseEntry)
      .filter((video): video is YoutubeVideo => video !== null)
      .slice(0, limit)
  } catch {
    return []
  }
}
