import { cache } from 'react'
import { parse } from 'rss-to-json'

export const podcastConfig: PodcastConfig = {
  directories: [
    'https://podcasts.apple.com/us/podcast/technicality/id1644743520',
    'https://open.spotify.com/show/4B0ICTKYqQe14UosFxthQv',
    'https://podcasts.google.com/feed/aHR0cHM6Ly9mZWVkcy5jYXN0b3MuY29tL3ZkcHg0',
    'https://www.youtube.com/calicastle',
    'https://space.bilibili.com/8350251',
  ],
  hosts: [
    {
      name: 'Cali Castle',
      link: 'https://cali.so/',
    },
  ],
}

/**
 * Get podcast via RSS feed.
 */
export const getPodcast = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const podcast: Podcast = {
    title: feed.title,
    description: feed.description,
    link: feed.link,
    coverArt: feed.image,
  }

  return podcast
})

/**
 * Encode episode id.
 * (Certain episode id contains special characters that are not allowed in URL)
 */
function encodeEpisodeId(raw: string): string {
  if (!raw.startsWith('http')) {
    return raw
  }

  const url = new URL(raw)
  const path = url.pathname.split('/')
  const lastPathname = path[path.length - 1]

  if (lastPathname === '' && url.search) {
    return url.search.slice(1)
  }

  return lastPathname
}

/**
 * Get podcast episodes via RSS feed.
 */
export const getPodcastEpisodes = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const episodes: Episode[] = feed.items.map((item) => ({
    id: encodeEpisodeId(item.id ?? item.link),
    title: item.title,
    description: item.description,
    link: item.link,
    published: item.published,
    content: item.content,
    duration: item.itunes_duration,
    enclosure: item.enclosures[0],
    coverArt: item.itunes_image?.href,
  }))

  return episodes
})

/**
 * Get podcast episode by id.
 */
export const getPodcastEpisode = cache(async (id: string) => {
  const episodes = await getPodcastEpisodes()
  const decodedId = decodeURIComponent(id)
  return episodes.find(
    (episode) => episode.id === decodedId || episode.link.endsWith(decodedId)
  )
})
