import type {
  GlobalSettings,
  StrapiGlobalData,
  StrapiGlobalResponse,
  StrapiMedia,
  StrapiSocialLinkItem
} from '~/types/global'

const pickText = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const normalizePath = (value?: string | null) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const toSameAs = (value?: Array<string | StrapiSocialLinkItem> | null) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim()
      }

      if (item && typeof item === 'object' && typeof item.url === 'string') {
        return item.url.trim()
      }

      return ''
    })
    .filter(Boolean)
}

const readMediaUrl = (media?: StrapiMedia | string | null) => {
  if (!media) {
    return ''
  }

  if (typeof media === 'string') {
    return media.trim()
  }

  return pickText(
    media.url,
    media.data?.url,
    media.data?.attributes?.url
  )
}

const mergeAttributes = (data?: StrapiGlobalData | null): StrapiGlobalData => {
  if (!data) {
    return {}
  }

  if (!data.attributes) {
    return data
  }

  return {
    ...data.attributes,
    ...data
  }
}

const normalizeGlobalSettings = (response: StrapiGlobalResponse | null, toMediaUrl: (url?: string | null) => string): GlobalSettings | null => {
  const entry = mergeAttributes(response?.data)

  if (!Object.keys(entry).length) {
    return null
  }

  const business = entry.businessAddress || {}
  const defaultSeo = entry.defaultSeo || {}

  return {
    siteName: pickText(entry.siteName),
    siteDescription: pickText(entry.siteDescription),
    siteSlogan: pickText(entry.siteSlogan),
    siteLanguage: pickText(entry.siteLanguage),
    defaultCurrency: pickText(entry.defaultCurrency),
    supportEmail: pickText(entry.supportEmail),
    supportPhone: pickText(entry.supportPhone),
    twitterSite: pickText(entry.twitterSite),
    siteSearchUrl: pickText(entry.siteSearchUrl),
    siteLogo: toMediaUrl(readMediaUrl(entry.siteLogo)),
    defaultOgImage: toMediaUrl(readMediaUrl(entry.defaultOgImage)),
    favicon: toMediaUrl(readMediaUrl(entry.favicon)),
    siteSameAs: toSameAs(entry.sameAs),
    businessStreetAddress: pickText(business.streetAddress),
    businessAddressLocality: pickText(business.addressLocality),
    businessAddressRegion: pickText(business.addressRegion),
    businessPostalCode: pickText(business.postalCode),
    businessAddressCountry: pickText(business.addressCountry),
    defaultSeo: {
      metaTitle: pickText(defaultSeo.metaTitle),
      metaDescription: pickText(defaultSeo.metaDescription),
      metaImage: toMediaUrl(readMediaUrl(defaultSeo.metaImage)),
      canonicalPath: normalizePath(defaultSeo.canonicalPath),
      noindex: Boolean(defaultSeo.noindex),
      nofollow: Boolean(defaultSeo.nofollow)
    }
  }
}

export const useGlobalSettings = () => {
  const { buildApiUrl, toMediaUrl } = useStrapi()
  const endpoint = buildApiUrl('/api/global?populate=*')

  return useAsyncData<GlobalSettings | null, Error | null>('global-settings', async () => {
    try {
      const response = await $fetch<StrapiGlobalResponse>(endpoint)
      return normalizeGlobalSettings(response, toMediaUrl)
    } catch {
      return null
    }
  }, {
    server: true,
    default: () => null
  })
}
