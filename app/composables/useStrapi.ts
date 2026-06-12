import { buildAbsoluteUrl } from '~/utils/schema'

export const useStrapi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.strapiUrl || 'http://127.0.0.1:1337'
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  const buildApiUrl = (path: string) => {
    if (!path) {
      return `${normalizedBaseUrl}/api`
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizedBaseUrl}${normalizedPath}`
  }

  const toMediaUrl = (url?: string | null) => {
    if (!url) {
      return ''
    }

    if (/^https?:\/\//i.test(url)) {
      return url
    }

    const normalizedPath = url.startsWith('/') ? url : `/${url}`
    return `${normalizedBaseUrl}${normalizedPath}`
  }

  const extractMediaUrl = (source?: unknown): string => {
    if (!source) {
      return ''
    }

    if (typeof source === 'string') {
      return source
    }

    if (typeof source !== 'object') {
      return ''
    }

    const media = source as {
      url?: string
      data?: {
        url?: string
        attributes?: {
          url?: string
          formats?: {
            large?: { url?: string }
            medium?: { url?: string }
          }
        }
      }
      formats?: {
        large?: { url?: string }
        medium?: { url?: string }
      }
    }

    return media.formats?.large?.url
      || media.data?.attributes?.formats?.large?.url
      || media.formats?.medium?.url
      || media.data?.attributes?.formats?.medium?.url
      || media.url
      || media.data?.attributes?.url
      || media.data?.url
      || ''
  }

  const resolveImageUrl = (source?: unknown, siteUrl?: string) => {
    const url = extractMediaUrl(source)
    if (!url) {
      return ''
    }

    if (/^https?:\/\//i.test(url)) {
      return url
    }

    const normalizedPath = url.startsWith('/') ? url : `/${url}`

    if (normalizedPath.startsWith('/uploads/')) {
      return toMediaUrl(normalizedPath)
    }

    return buildAbsoluteUrl(normalizedPath, siteUrl || '')
  }

  return {
    strapiUrl: normalizedBaseUrl,
    buildApiUrl,
    toMediaUrl,
    resolveImageUrl
  }
}
