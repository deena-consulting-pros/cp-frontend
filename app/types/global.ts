export interface StrapiMedia {
  url?: string | null
  alternativeText?: string | null
  data?: {
    url?: string | null
    alternativeText?: string | null
    attributes?: {
      url?: string | null
      alternativeText?: string | null
    } | null
  } | null
}

export interface StrapiGlobalDefaultSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  metaImage?: StrapiMedia | string | null
  canonicalPath?: string | null
  noindex?: boolean | null
  nofollow?: boolean | null
}

export interface StrapiGlobalBusinessAddress {
  streetAddress?: string | null
  addressLocality?: string | null
  addressRegion?: string | null
  postalCode?: string | null
  addressCountry?: string | null
}

export interface StrapiSocialLinkItem {
  label?: string | null
  url?: string | null
  newTab?: boolean | null
  icon?: string | null
}

export interface StrapiGlobalData {
  siteName?: string | null
  siteDescription?: string | null
  siteSlogan?: string | null
  siteLanguage?: string | null
  defaultCurrency?: string | null
  supportEmail?: string | null
  supportPhone?: string | null
  twitterSite?: string | null
  siteSearchUrl?: string | null
  siteLogo?: StrapiMedia | string | null
  defaultOgImage?: StrapiMedia | string | null
  favicon?: StrapiMedia | string | null
  sameAs?: Array<string | StrapiSocialLinkItem> | null
  businessAddress?: StrapiGlobalBusinessAddress | null
  defaultSeo?: StrapiGlobalDefaultSeo | null
  attributes?: StrapiGlobalData | null
}

export interface StrapiGlobalResponse {
  data?: StrapiGlobalData | null
}

export interface GlobalSettings {
  siteName: string
  siteDescription: string
  siteSlogan: string
  siteLanguage: string
  defaultCurrency: string
  supportEmail: string
  supportPhone: string
  twitterSite: string
  siteSearchUrl: string
  siteLogo: string
  defaultOgImage: string
  favicon: string
  siteSameAs: string[]
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
