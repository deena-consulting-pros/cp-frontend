export type JsonLdRecord = Record<string, unknown>

export interface SchemaNavigationItem {
  name: string
  url: string
}

export interface OrganizationSchemaInput {
  siteUrl: string
  name: string
  logo?: string
  description?: string
  slogan?: string
  sameAs?: string[]
  supportEmail?: string
  supportPhone?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
}

export interface WebsiteSchemaInput {
  siteUrl: string
  name: string
  description?: string
  navigation?: SchemaNavigationItem[]
  searchUrl?: string
}

export interface WebPageSchemaInput {
  canonicalUrl: string
  siteUrl: string
  name: string
  description?: string
  inLanguage?: string
  primaryImageOfPage?: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage'
  id?: string
  breadcrumbId?: string
}

export interface SchemaBreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbSchemaInput {
  id: string
  items: SchemaBreadcrumbItem[]
}

export interface ServicesSchemaItemInput {
  id: string
  name: string
  description?: string
  position?: number
  url?: string
}

export interface ServicesSchemaInput {
  siteUrl: string
  catalogId: string
  name: string
  description?: string
  serviceItems: ServicesSchemaItemInput[]
}

const trimSlashes = (value: string) => value.replace(/\/+$/, '')
const trim = (value?: string | null) => typeof value === 'string' ? value.trim() : ''
const isLocalhostHost = (value: string) => /(^|\.)localhost$|^127\.|^0\.0\.0\.0$|^::1$/i.test(value)

export const normalizeAbsoluteUrl = (value?: string | null) => {
  const trimmed = trim(value)
  if (!trimmed) {
    return ''
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return ''
  }

  try {
    const parsed = new URL(trimmed)
    return trimSlashes(parsed.toString())
  } catch {
    return ''
  }
}

export const buildAbsoluteUrl = (path: string, siteUrl: string) => {
  const normalizedSiteUrl = normalizeAbsoluteUrl(siteUrl)

  if (!normalizedSiteUrl) {
    return ''
  }

  if (!path?.trim()) {
    return ''
  }

  if (/^https?:\/\//i.test(path)) {
    return trimSlashes(path)
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedPath === '/') {
    return normalizedSiteUrl
  }

  return `${normalizedSiteUrl}${normalizedPath}`
}

export const buildOrganizationSchema = (input: OrganizationSchemaInput): JsonLdRecord => {
  const organization: JsonLdRecord = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${input.siteUrl}/#organization`,
    name: input.name,
    url: input.siteUrl
  }

  if (input.logo) {
    organization.logo = input.logo
  }

  if (input.description) {
    organization.description = input.description
  }

  if (input.slogan) {
    organization.slogan = input.slogan
  }

  if (input.sameAs?.length) {
    organization.sameAs = input.sameAs
  }

  if (input.address) {
    const hasAddressData = Object.values(input.address).some((value) => Boolean(value))

    if (hasAddressData) {
      organization.address = {
        '@type': 'PostalAddress',
        ...input.address
      }
    }
  }

  const contactPoint: JsonLdRecord = {
    '@type': 'ContactPoint',
    contactType: 'customer support'
  }

  if (input.supportEmail) {
    contactPoint.email = input.supportEmail
  }

  if (input.supportPhone) {
    contactPoint.telephone = input.supportPhone
  }

  if (contactPoint.email || contactPoint.telephone) {
    organization.contactPoint = contactPoint
  }

  return organization
}

export const buildWebsiteSchema = (input: WebsiteSchemaInput): JsonLdRecord => {
  const website: JsonLdRecord = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${input.siteUrl}/#website`,
    name: input.name,
    url: input.siteUrl,
    publisher: {
      '@id': `${input.siteUrl}/#organization`
    }
  }

  if (input.description) {
    website.description = input.description
  }

  if (input.searchUrl && input.searchUrl.includes('{search_term_string}')) {
    website.potentialAction = {
      '@type': 'SearchAction',
      target: input.searchUrl,
      'query-input': 'required name=search_term_string'
    }
  }

  if (input.navigation?.length) {
    website.hasPart = input.navigation.map((item) => ({
      '@type': 'SiteNavigationElement',
      name: item.name,
      url: item.url
    }))
  }

  return website
}

export const buildWebPageSchema = (input: WebPageSchemaInput): JsonLdRecord => {
  const pageType = input.type || 'WebPage'
  const webPage: JsonLdRecord = {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': input.id || `${input.canonicalUrl}#webpage`,
    url: input.canonicalUrl,
    name: input.name,
    isPartOf: {
      '@id': `${input.siteUrl}/#website`
    },
    about: {
      '@id': `${input.siteUrl}/#organization`
    }
  }

  if (input.description) {
    webPage.description = input.description
  }

  if (input.inLanguage) {
    webPage.inLanguage = input.inLanguage
  }

  if (input.primaryImageOfPage) {
    webPage.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: input.primaryImageOfPage
    }
  }

  if (input.breadcrumbId) {
    webPage.breadcrumb = {
      '@id': input.breadcrumbId
    }
  }

  return webPage
}

export const buildBreadcrumbSchema = (input: BreadcrumbSchemaInput): JsonLdRecord => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': input.id,
  itemListElement: input.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
})

export const buildServicesSchema = (input: ServicesSchemaInput): JsonLdRecord => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  '@id': input.catalogId,
  name: input.name,
  ...(input.description ? { description: input.description } : {}),
  itemListElement: input.serviceItems.map((service) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: service.name,
      ...(service.description ? { description: service.description } : {}),
      ...(service.url ? { url: service.url } : {}),
      provider: {
        '@id': `${input.siteUrl}/#organization`
      }
    }
  }))
})

export const sanitizeSchemaUrl = (value: string, siteUrl: string, options?: { allowExternal?: boolean }) => {
  const normalizedValue = normalizeAbsoluteUrl(value)
  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedValue = new URL(normalizedValue)
    if (isLocalhostHost(parsedValue.hostname)) {
      return ''
    }

    if (options?.allowExternal) {
      return normalizedValue
    }

    const normalizedSiteUrl = normalizeAbsoluteUrl(siteUrl)
    if (!normalizedSiteUrl) {
      return ''
    }

    const parsedSite = new URL(normalizedSiteUrl)
    return parsedValue.origin === parsedSite.origin ? normalizedValue : ''
  } catch {
    return ''
  }
}
