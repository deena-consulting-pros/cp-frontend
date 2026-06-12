export type PageMetaType = 'home' | 'page' | 'product' | 'article' | 'collection'

export interface PageMetaImageInput {
  url?: string
  alt?: string
  width?: number
  height?: number
}

export interface ProductMetaInput {
  priceAmount?: number | string
  currency?: string
}

export interface HeadMetaTagInput {
  key: string
  name?: string
  property?: string
  content: string
  [key: `data-${string}`]: string | undefined
}

export interface PageMetaInput {
  pageType: PageMetaType
  title: string
  description?: string
  canonicalPath?: string
  image?: PageMetaImageInput
  noindex?: boolean
  nofollow?: boolean
  product?: ProductMetaInput
}

export const getOgTypeByPage = (pageType: PageMetaType) => {
  if (pageType === 'article') {
    return 'article'
  }

  return 'website'
}

export const hasPaginationQuery = (query: Record<string, unknown>) => {
  const pageValue = query.page

  if (Array.isArray(pageValue)) {
    return pageValue.some((value) => String(value).trim().length > 0)
  }

  if (typeof pageValue === 'number') {
    return true
  }

  if (typeof pageValue === 'string') {
    return pageValue.trim().length > 0
  }

  return false
}

export const buildRobotsContent = (input: {
  isPaginated: boolean
  noindex?: boolean
  nofollow?: boolean
}) => {
  if (input.isPaginated || input.noindex) {
    return 'noindex, nofollow'
  }

  if (input.nofollow) {
    return 'index, nofollow'
  }

  return 'index, follow'
}

export const stripHash = (value: string) => {
  const hashIndex = value.indexOf('#')

  if (hashIndex === -1) {
    return value
  }

  return value.slice(0, hashIndex)
}

export const toSecureUrl = (url?: string) => {
  if (!url) {
    return ''
  }

  if (url.startsWith('https://')) {
    return url
  }

  return ''
}
