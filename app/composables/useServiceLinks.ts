import type { StrapiServiceItem, StrapiServicesCollectionResponse } from '~/types/services'

export interface ServiceLink {
  id: string
  title: string
  slug: string
  url: string
  order?: number
}

const isPublishedEntry = (record: Record<string, unknown>): boolean => {
  // Strapi's public API returns only published entries by default, but if a
  // draft ever leaks through (or publishedAt is explicitly returned), filter it out.
  if (Object.prototype.hasOwnProperty.call(record, 'publishedAt')) {
    return record.publishedAt !== null && record.publishedAt !== undefined
  }
  return true
}

export const useServiceLinks = async () => {
  const { buildApiUrl } = useStrapi()

  const endpoint = buildApiUrl(
    '/api/services?fields[0]=title&fields[1]=slug&fields[2]=order&fields[3]=publishedAt&sort[0]=order:asc'
  )

  const { data } = await useAsyncData<StrapiServicesCollectionResponse | null>(
    'service-links',
    async () => {
      try {
        return await $fetch<StrapiServicesCollectionResponse>(endpoint)
      }
      catch {
        return null
      }
    },
    {
      server: true,
      default: () => null
    }
  )

  const serviceLinks = computed<ServiceLink[]>(() => {
    const items = data.value?.data
    if (!Array.isArray(items)) {
      return []
    }

    return items
      .map((item) => {
        const raw = item && typeof item === 'object' ? item : {}
        const entry = 'attributes' in raw && raw.attributes && typeof raw.attributes === 'object'
          ? { ...(raw.attributes as Record<string, unknown>), ...raw }
          : (raw as Record<string, unknown>)

        if (!isPublishedEntry(entry)) {
          return null
        }

        const title = String(entry.title || '').trim()
        const slug = String(entry.slug || '').trim()
        if (!title || !slug) {
          return null
        }

        const order = typeof entry.order === 'number' ? entry.order : undefined

        return {
          id: String(entry.id || slug),
          title,
          slug,
          url: `/services/${slug}`,
          order
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
  })

  return {
    serviceLinks,
    data
  }
}
