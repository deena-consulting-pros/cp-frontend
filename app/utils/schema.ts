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
  email?: string
  telephone?: string
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
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'
  id?: string
  breadcrumbId?: string
  about?: string
  publisher?: string
}

export interface SchemaBreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbSchemaInput {
  id: string
  items: SchemaBreadcrumbItem[]
}

export interface ServiceListItemInput {
  id: string
  name: string
  description?: string
  url?: string
}

export interface ServiceItemListSchemaInput {
  listId: string
  siteUrl: string
  name: string
  description?: string
  serviceItems: ServiceListItemInput[]
}

const trimSlashes = (value: string) => value.replace(/\/+$/, '')
const trim = (value?: string | null) => typeof value === 'string' ? value.trim() : ''
const isLocalhostHost = (value: string) => /(^|\.)localhost$|^127\.|^0\.0\.0\.0$|^::1$/i.test(value)

export const isLocalhostUrl = (value?: string | null): boolean => {
  const normalized = normalizeAbsoluteUrl(value)
  if (!normalized) {
    return false
  }

  try {
    return isLocalhostHost(new URL(normalized).hostname)
  } catch {
    return false
  }
}

const normalizeCountryCode = (value?: string | null) => {
  const code = trim(value).toUpperCase()
  if (code === 'AE' || code === 'ARE' || code === 'UNITED ARAB EMIRATES' || code === 'UAE') {
    return 'AE'
  }
  return code.length === 2 ? code : ''
}

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

  if (input.email) {
    organization.email = input.email
  }

  if (input.telephone) {
    organization.telephone = input.telephone
  }

  if (input.sameAs?.length) {
    organization.sameAs = input.sameAs
  }

  if (input.address) {
    const normalizedAddress = {
      ...input.address,
      addressCountry: input.address.addressCountry
        ? normalizeCountryCode(input.address.addressCountry)
        : undefined
    }

    const hasAddressData = Object.values(normalizedAddress).some((value) => Boolean(value))

    if (hasAddressData) {
      organization.address = {
        '@type': 'PostalAddress',
        ...normalizedAddress
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
    }
  }

  webPage.about = {
    '@id': input.about || `${input.siteUrl}/#organization`
  }

  if (input.publisher) {
    webPage.publisher = {
      '@id': input.publisher
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

export const buildServiceItemListSchema = (input: ServiceItemListSchemaInput): JsonLdRecord => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': input.listId,
  name: input.name,
  ...(input.description ? { description: input.description } : {}),
  itemListElement: input.serviceItems.map((service, index) => {
    const serviceItem: JsonLdRecord = {
      '@type': 'Service',
      '@id': service.url ? `${service.url}#service` : `${input.siteUrl}/#service-${service.id}`,
      name: service.name,
      provider: {
        '@id': `${input.siteUrl}/#organization`
      }
    }

    if (service.description) {
      serviceItem.description = service.description
    }

    if (service.url) {
      serviceItem.url = service.url
    }

    return {
      '@type': 'ListItem',
      position: index + 1,
      item: serviceItem
    }
  })
})

export interface ServiceSchemaInput {
  id: string
  name: string
  url: string
  description?: string
  serviceType?: string
  providerId?: string
  areaServed?: string | string[]
}

export const buildServiceSchema = (input: ServiceSchemaInput): JsonLdRecord => {
  const service: JsonLdRecord = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': input.id,
    name: input.name,
    url: input.url
  }

  if (input.description) {
    service.description = input.description
  }

  if (input.serviceType) {
    service.serviceType = input.serviceType
  }

  if (input.providerId) {
    service.provider = {
      '@id': input.providerId
    }
  }

  if (input.areaServed) {
    service.areaServed = input.areaServed
  }

  return service
}

export interface FaqSchemaItemInput {
  question: string
  answer: string
}

export interface FaqPageSchemaInput {
  id: string
  mainEntity: FaqSchemaItemInput[]
}

export const buildFaqPageSchema = (input: FaqPageSchemaInput): JsonLdRecord => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': input.id,
  mainEntity: input.mainEntity.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
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
      return parsedValue.protocol === 'https:' ? normalizedValue : ''
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
