import { isLocalhostUrl, normalizeAbsoluteUrl } from '~/utils/schema'
import type { GlobalSettings } from '~/types/global'

interface SeoDefaults {
  siteUrl: string
  siteName: string
  siteDescription: string
  siteLogo: string
  defaultOgImage: string
  favicon: string
  twitterSite: string
  defaultCurrency: string
  siteSlogan: string
  siteSameAs: string[]
  supportEmail: string
  supportPhone: string
  siteLanguage: string
  siteSearchUrl: string
  businessStreetAddress: string
  businessAddressLocality: string
  businessAddressRegion: string
  businessPostalCode: string
  businessAddressCountry: string
  defaultSeo: {
    metaTitle: string
    metaDescription: string
    metaImage: string
    canonicalPath: string
    noindex: boolean
    nofollow: boolean
  }
}

const pickFirst = (...values: Array<string | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const toList = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export const useSeoDefaults = (): SeoDefaults => {
  const config = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const { data } = useNuxtData<GlobalSettings | null>('global-settings')
  const global = data.value || null

  const fallbackSiteUrl = normalizeAbsoluteUrl(requestUrl.origin) || 'http://localhost:3000'
  const configuredSiteUrl = normalizeAbsoluteUrl(config.public.siteUrl)

  const siteUrl = configuredSiteUrl && !isLocalhostUrl(configuredSiteUrl)
    ? configuredSiteUrl
    : fallbackSiteUrl

  return {
    siteUrl,
    siteName: pickFirst(global?.siteName, config.public.siteName, 'Consulting Pros'),
    siteDescription: pickFirst(global?.siteDescription, config.public.siteDescription),
    siteLogo: pickFirst(global?.siteLogo, config.public.siteLogo),
    defaultOgImage: pickFirst(global?.defaultOgImage, config.public.defaultOgImage),
    favicon: pickFirst(global?.favicon),
    twitterSite: pickFirst(global?.twitterSite, config.public.twitterSite),
    defaultCurrency: pickFirst(global?.defaultCurrency, config.public.defaultCurrency),
    siteSlogan: pickFirst(global?.siteSlogan, config.public.siteSlogan),
    siteSameAs: toList(global?.siteSameAs?.length ? global.siteSameAs : config.public.siteSameAs),
    supportEmail: pickFirst(global?.supportEmail, config.public.supportEmail),
    supportPhone: pickFirst(global?.supportPhone, config.public.supportPhone),
    siteLanguage: pickFirst(global?.siteLanguage, config.public.siteLanguage, 'en'),
    siteSearchUrl: pickFirst(global?.siteSearchUrl, config.public.siteSearchUrl),
    businessStreetAddress: pickFirst(global?.businessStreetAddress, config.public.businessStreetAddress),
    businessAddressLocality: pickFirst(global?.businessAddressLocality, config.public.businessAddressLocality),
    businessAddressRegion: pickFirst(global?.businessAddressRegion, config.public.businessAddressRegion),
    businessPostalCode: pickFirst(global?.businessPostalCode, config.public.businessPostalCode),
    businessAddressCountry: pickFirst(global?.businessAddressCountry, config.public.businessAddressCountry),
    defaultSeo: {
      metaTitle: pickFirst(global?.defaultSeo?.metaTitle),
      metaDescription: pickFirst(global?.defaultSeo?.metaDescription),
      metaImage: pickFirst(global?.defaultSeo?.metaImage),
      canonicalPath: pickFirst(global?.defaultSeo?.canonicalPath),
      noindex: Boolean(global?.defaultSeo?.noindex),
      nofollow: Boolean(global?.defaultSeo?.nofollow)
    }
  }
}
